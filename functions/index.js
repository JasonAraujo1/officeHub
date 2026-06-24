const { onObjectFinalized } = require("firebase-functions/v2/storage")
const { onDocumentCreated } = require("firebase-functions/v2/firestore")
const { onCall, HttpsError } = require("firebase-functions/v2/https")
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

// ===================================================================
// IA do Controlaí — chat de gestão ágil (Groq), liberado após o questionário.
// Base: "primer" embutido + respostas do questionário do usuário.
// Para evoluir: acrescente seus materiais em AGILE_KNOWLEDGE abaixo.
// ===================================================================
const AGILE_KNOWLEDGE = `
PRINCÍPIOS (Manifesto Ágil): indivíduos e interações acima de processos; software/entregas funcionando acima de documentação excessiva; colaboração acima de contratos; responder a mudanças acima de seguir um plano fixo.
SCRUM: papéis (Product Owner, Scrum Master, Time); eventos (Sprint 1–4 semanas, Planning, Daily 15min, Review, Retrospective); artefatos (Product Backlog, Sprint Backlog, Incremento); Definition of Done.
KANBAN: quadro A fazer/Fazendo/Feito; limitar WIP (trabalho em progresso); puxar tarefas; métricas de lead time e throughput; melhoria contínua.
REUNIÕES EFICAZES: ter objetivo claro, pauta, time-box, participantes certos, decisões e responsáveis registrados ao final. Formatos comuns: daily standup, planejamento, revisão/demonstração, retrospectiva, 1:1, alinhamento semanal, kickoff.
PAUTAS: abertura/objetivo; pontos a tratar com tempo; decisões; próximos passos com responsável e prazo.
RETROSPECTIVA: o que foi bem, o que pode melhorar, ações. Formatos: "Start/Stop/Continue", "Mad/Sad/Glad".
RELATÓRIOS/ATAS: contexto, participantes, decisões, pendências (o que falta), responsáveis e prazos.
ADAPTAÇÃO POR TAMANHO: equipes pequenas (1–15) podem usar Kanban leve + 1 reunião semanal; equipes maiores se beneficiam de Scrum com cadência definida.
`

exports.chatAgile = onCall(
  { region: "us-east1", secrets: [GROQ_API_KEY], timeoutSeconds: 60, memory: "256MiB" },
  async (request) => {
    if (!request.auth) throw new HttpsError("unauthenticated", "Faça login.")
    const groqKey = GROQ_API_KEY.value()
    const inMsgs = Array.isArray(request.data?.messages) ? request.data.messages : []
    const survey = request.data?.survey || {}

    // contexto do questionário
    const surveyText = Object.entries(survey)
      .filter(([, v]) => v)
      .map(([k, v]) => `- ${k}: ${v}`)
      .join("\n") || "(sem respostas)"

    // histórico recente (limita para caber no contexto)
    const history = inMsgs
      .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .slice(-16)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }))

    const system = {
      role: "system",
      content:
        "Você é a IA do Controlaí, uma assistente especialista em GESTÃO ÁGIL para equipes e empresas. " +
        "Responda SEMPRE em português do Brasil, de forma prática e objetiva. Quando útil, entregue modelos prontos " +
        "(pautas de reunião, formatos de reunião, atividades, roteiros de palestra, modelos de relatório/ata) que o usuário possa copiar e adaptar. " +
        "Sugira melhorias com base no padrão atual da equipe. Use o conhecimento abaixo e o perfil do usuário. " +
        "Se a pergunta fugir muito de gestão/produtividade/equipes, traga de volta ao tema com gentileza.\n\n" +
        "CONHECIMENTO DE BASE:\n" + AGILE_KNOWLEDGE + "\n" +
        "PERFIL DA EQUIPE (do questionário):\n" + surveyText,
    }

    const callGroq = () =>
      fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { authorization: "Bearer " + groqKey, "content-type": "application/json" },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          temperature: 0.6,
          messages: [system, ...history],
        }),
      })

    let gq = await callGroq()
    if (!gq.ok) {
      logger.warn("chatAgile 1ª tentativa falhou:", gq.status)
      await sleep(4000)
      gq = await callGroq()
      if (!gq.ok) throw new HttpsError("internal", "Falha ao consultar a IA.")
    }
    const json = await gq.json()
    const reply = json?.choices?.[0]?.message?.content || ""
    return { reply }
  }
)
