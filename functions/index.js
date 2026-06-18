const { onObjectFinalized } = require("firebase-functions/v2/storage")
const { defineSecret } = require("firebase-functions/params")
const { initializeApp } = require("firebase-admin/app")
const { getFirestore } = require("firebase-admin/firestore")
const { getStorage } = require("firebase-admin/storage")
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

      const utterances = (t.utterances || []).map((u) => ({
        speaker: "Interlocutor " + (u.speaker || "?"),
        text: u.text || "",
        start: Math.round((u.start || 0) / 1000),
      }))
      const speakerCount = new Set((t.utterances || []).map((u) => u.speaker)).size

      // 5) gera os relatórios com Groq (Llama 3.3 — camada gratuita, API compatível com OpenAI)
      const messages = [
        {
          role: "system",
          content:
            "Você é um analista de áudio. A partir da transcrição com interlocutores, gere um JSON em português com os campos: fullReport (relatório completo de audiodescrição, detalhado e em texto corrido), summary (objeto com abstract, topics que é um array de tópicos otimizados, e actions que é um array de ações sugeridas) e speakers (número de interlocutores). Identifique e interprete os interlocutores. Responda APENAS com JSON válido.",
        },
        { role: "user", content: "Transcrição: " + JSON.stringify(t.utterances || t.text) },
      ]
      const gq = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { authorization: "Bearer " + groqKey, "content-type": "application/json" },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          response_format: { type: "json_object" },
          temperature: 0.4,
          messages,
        }),
      })
      if (!gq.ok) throw new Error("Groq falhou: " + (await gq.text()))
      const gqJson = await gq.json()
      const ai = JSON.parse(gqJson.choices[0].message.content)
      const sm = ai.summary || {}
      await setProgress(95, "Finalizando")

      // 6) grava o resultado no Firestore
      await docRef.set(
        {
          status: "done",
          progress: 100,
          stage: "Concluído",
          fullReport: ai.fullReport || "",
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
      logger.error("Falha ao processar", reportId, e)
      await docRef.set({ status: "error", error: String(e.message || e) }, { merge: true })
    }
  }
)
