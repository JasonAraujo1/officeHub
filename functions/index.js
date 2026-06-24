const { onObjectFinalized } = require("firebase-functions/v2/storage")
const { onDocumentCreated } = require("firebase-functions/v2/firestore")
const { defineSecret } = require("firebase-functions/params")
const { initializeApp } = require("firebase-admin/app")
const { getFirestore } = require("firebase-admin/firestore")
const { getStorage } = require("firebase-admin/storage")
const { getMessaging } = require("firebase-admin/messaging")
const logger = require("firebase-functions/logger")

initializeApp()

const ASSEMBLYAI_API_KEY = defineSecret("ASSEMBLYAI_API_KEY")
const GROQ_API_KEY = defineSecret("GROQ_API_KEY")

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Dispara quando um áudio é enviado para users/{uid}/audios/{id}.ext
exports.processAudio = onObjectFinalized(
  {
    region: "us-east1",
    secrets: [ASSEMBLYAI_API_KEY, GROQ_API_KEY],
    timeoutSeconds: 540,
    memory: "512MiB",
  },
  async (event) => {
    const filePath = event.data.name || ""
    const m = filePath.match(/^users\/([^/]+)\/audios\/([^/.]+)\./)
    if (!m) {
      logger.info("Arquivo fora do padrão, ignorando:", filePath)
      return
    }
    const uid = m[1]
    const reportId = m[2]
    const db = getFirestore()
    const docRef = db.doc(`users/${uid}/reports/${reportId}`)
    const setProgress = (progress, stage) =>
      docRef.set({ status: "processing", progress, stage }, { merge: true })

    try {
      const aaiKey = ASSEMBLYAI_API_KEY.value()
      const groqKey = GROQ_API_KEY.value()

      // 1) baixa o áudio do Storage
      await setProgress(10, "Enviando áudio")
      const bucket = getStorage().bucket(event.data.bucket)
      const [buf] = await bucket.file(filePath).download()

      // 2) envia o áudio pro AssemblyAI
      const up = await fetch("https://api.assemblyai.com/v2/upload", {
        method: "POST",
        headers: { authorization: aaiKey, "content-type": "application/octet-stream" },
        body: buf,
      })
      if (!up.ok) throw new Error("Upload AssemblyAI falhou: " + (await up.text()))
      const { upload_url } = await up.json()

      // 3) cria a transcrição com diarização (separa interlocutores)
      await setProgress(30, "Transcrevendo áudio")
      const tr = await fetch("https://api.assemblyai.com/v2/transcript", {
        method: "POST",
        headers: { authorization: aaiKey, "content-type": "application/json" },
        body: JSON.stringify({ audio_url: upload_url, speaker_labels: true, language_code: "pt" }),
      })
      if (!tr.ok) throw new Error("Transcript AssemblyAI falhou: " + (await tr.text()))
      const { id: transcriptId } = await tr.json()

      // 4) aguarda a conclusão (polling) — vai subindo a barra de 30% a 70%
      let t
      for (let i = 0; i < 120; i++) {
        await sleep(5000)
        const st = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
          headers: { authorization: aaiKey },
        })
        t = await st.json()
        if (t.status === "completed") break
        if (t.status === "error") throw new Error("AssemblyAI erro: " + t.error)
        await setProgress(Math.min(70, 35 + i * 3), "Transcrevendo áudio")
      }
      if (!t || t.status !== "completed") throw new Error("Transcrição não concluiu a tempo")
      await setProgress(80, "Gerando relatório")

      // modelo de formatação definido pelo usuário (prompt/documento de referência)
      let formatPrompt = ""
      try {
        const snap = await docRef.get()
        if (snap.exists) formatPrompt = (snap.data().formatPrompt || "").toString().slice(0, 4000)
      } catch (e) { logger.warn("Sem formatPrompt:", e) }

      const utterances = (t.utterances || []).map((u) => ({
        speaker: "Interlocutor " + (u.speaker || "?"),
        text: u.text || "",
        start: Math.round((u.start || 0) / 1000),
      }))
      const speakerCount = new Set((t.utterances || []).map((u) => u.speaker)).size

      // 5) gera os relatórios com Groq (Llama 3.3 — camada gratuita, API compatível com OpenAI)
      // Monta uma transcrição COMPACTA ("Interlocutor: fala"). Mandar o JSON bruto
      // das utterances (com o array de palavras de cada fala) estoura o limite de
      // tokens do Groq em áudios longos — era a causa do "erro ao processar".
      let transcriptText = utterances.length
        ? utterances.map((u) => `${u.speaker}: ${u.text}`).join("\n")
        : (t.text || "")
      // rede de segurança: corta transcrições muito longas (~48k chars ≈ limite seguro)
      const MAX_CHARS = 48000
      if (transcriptText.length > MAX_CHARS) {
        transcriptText = transcriptText.slice(0, MAX_CHARS) + "\n[transcrição truncada por tamanho]"
      }

      const messages = [
        {
          role: "system",
          content:
            "Você é um analista de reuniões e conversas. A partir da transcrição com interlocutores, gere um JSON em português com EXATAMENTE estes campos: " +
            "summary (objeto com abstract = resumo em 3 a 6 frases, topics = array de tópicos principais, actions = array de ações sugeridas); " +
            "analysis = análise DETALHADA do diálogo em texto corrido, dividida em vários parágrafos, cobrindo: contexto e objetivo da conversa; quem são os interlocutores e a contribuição de cada um; o tom e a dinâmica (acordos, divergências, decisões); os principais pontos discutidos em profundidade; e as conclusões. Escreva com riqueza de detalhes, não resuma demais; " +
            "requested = array com o que foi pedido/solicitado durante a conversa, com frases específicas; " +
            "done = array com o que já foi feito, realizado ou decidido; " +
            "toDo = array com o que se quer que seja feito (próximos passos e pendências), incluindo responsável quando mencionado; " +
            "speakers = número de interlocutores. " +
            "Seja detalhado e fiel à conversa. Se algo não aparecer, devolva array vazio. Responda APENAS com JSON válido." +
            (formatPrompt
              ? " INSTRUÇÕES DE FORMATAÇÃO DO USUÁRIO (siga-as ao escrever o conteúdo dos campos, especialmente 'analysis': tom, estrutura, ênfases e o que destacar — mas NÃO altere os nomes dos campos do JSON nem deixe de retornar JSON válido): " + formatPrompt
              : ""),
        },
        { role: "user", content: "Transcrição:\n" + transcriptText },
      ]

      // chama o Groq com 1 tentativa extra para erro transitório (ex.: rate limit 429)
      const callGroq = () =>
        fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { authorization: "Bearer " + groqKey, "content-type": "application/json" },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" },
            temperature: 0.4,
            messages,
          }),
        })
      let gq = await callGroq()
      if (!gq.ok) {
        const errText = await gq.text()
        logger.warn("Groq 1ª tentativa falhou:", gq.status, errText)
        await sleep(8000)
        gq = await callGroq()
        if (!gq.ok) throw new Error("Groq falhou: " + gq.status + " " + (await gq.text()))
      }
      const gqJson = await gq.json()
      const raw = gqJson?.choices?.[0]?.message?.content || "{}"
      let ai
      try {
        ai = JSON.parse(raw)
      } catch (parseErr) {
        logger.warn("Groq retornou JSON inválido, tentando extrair:", raw.slice(0, 500))
        const match = raw.match(/\{[\s\S]*\}/)
        ai = match ? JSON.parse(match[0]) : {}
      }
      const sm = ai.summary || {}
      await setProgress(95, "Finalizando")

      // 6) grava o resultado no Firestore
      await docRef.set(
        {
          status: "done",
          progress: 100,
          stage: "Concluído",
          analysis: ai.analysis || ai.fullReport || "",
          fullReport: ai.analysis || ai.fullReport || "", // compat com versões antigas
          requested: ai.requested || [],
          done: ai.done || [],
          toDo: ai.toDo || ai.todo || [],
          summary: {
            abstract: sm.abstract || ai.abstract || "",
            topics: sm.topics || ai.topics || [],
            actions: sm.actions || ai.actions || [],
          },
          transcript: utterances,
          speakers: ai.speakers || speakerCount || 0,
          processedAt: new Date(),
        },
        { merge: true }
      )

      logger.info("Relatório pronto:", reportId)
    } catch (e) {
      // Detalhe técnico só no log; mensagem genérica no documento do usuário.
      logger.error("Falha ao processar", reportId, e)
      await docRef.set(
        { status: "error", error: "Não foi possível gerar o relatório." },
        { merge: true }
      )
    }
  }
)

// Envia notificação push (FCM) quando uma notificação é criada para um usuário.
exports.sendPush = onDocumentCreated(
  { region: "us-east1", document: "users/{uid}/notifications/{nid}" },
  async (event) => {
    const data = event.data && event.data.data()
    if (!data) return
    const uid = event.params.uid
    const db = getFirestore()
    const snap = await db.collection(`users/${uid}/pushTokens`).get()
    const tokens = snap.docs.map((d) => d.id)
    if (!tokens.length) return
    try {
      const res = await getMessaging().sendEachForMulticast({
        tokens,
        notification: { title: data.title || "Controlaí", body: data.body || "" },
        data: {
          reportId: String(data.reportId || ""),
          ownerUid: String(data.ownerUid || ""),
          type: String(data.type || ""),
        },
        webpush: { fcmOptions: { link: "/" } },
      })
      const dead = []
      res.responses.forEach((r, i) => { if (!r.success) dead.push(tokens[i]) })
      await Promise.all(dead.map((t) => db.doc(`users/${uid}/pushTokens/${t}`).delete().catch(() => {})))
    } catch (e) {
      logger.error("Falha ao enviar push", e)
    }
  }
)
