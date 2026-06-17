import { useState, useEffect, useRef } from "react"
import { Mic, Plus, FileText } from "../icons.jsx"
import WaveHeader from "../components/WaveHeader.jsx"
import { useAuth } from "../auth.jsx"
import { createReport } from "../lib/reports.js"

function fmt(s) {
  const m = String(Math.floor(s / 60)).padStart(2, "0")
  const ss = String(s % 60).padStart(2, "0")
  return `${m}:${ss}`
}

export default function Home({ go }) {
  const { user, logout } = useAuth()
  const nome = user?.displayName || user?.email?.split("@")[0] || "usuário"
  const [recording, setRecording] = useState(false)
  const [secs, setSecs] = useState(0)
  const [status, setStatus] = useState(null) // texto de feedback
  const [busy, setBusy] = useState(false)

  const fileRef = useRef()
  const timer = useRef()
  const mediaRec = useRef(null)
  const chunks = useRef([])
  const startedAt = useRef(0)

  useEffect(() => {
    if (recording) {
      timer.current = setInterval(() => setSecs((s) => s + 1), 1000)
    } else {
      clearInterval(timer.current)
    }
    return () => clearInterval(timer.current)
  }, [recording])

  async function startRecording() {
    setStatus(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const rec = new MediaRecorder(stream)
      chunks.current = []
      rec.ondataavailable = (e) => e.data.size && chunks.current.push(e.data)
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunks.current, { type: rec.mimeType || "audio/webm" })
        const dur = Math.round((Date.now() - startedAt.current) / 1000)
        await sendAudio(blob, `Gravação ${new Date().toLocaleString("pt-BR")}`, dur)
      }
      mediaRec.current = rec
      startedAt.current = Date.now()
      rec.start()
      setSecs(0)
      setRecording(true)
    } catch (e) {
      setStatus("Não foi possível acessar o microfone.")
      console.error(e)
    }
  }

  function stopRecording() {
    setRecording(false)
    mediaRec.current?.stop()
  }

  async function sendAudio(blob, title, durationSec, ext = "webm") {
    setBusy(true)
    setStatus("Enviando áudio para análise...")
    try {
      await createReport(blob, { title, durationSec, ext })
      setStatus("Áudio enviado! O relatório aparecerá em Relatórios.")
      setTimeout(() => go("reports"), 900)
    } catch (e) {
      setStatus("Erro ao enviar: " + (e?.message || e))
      console.error(e)
    } finally {
      setBusy(false)
    }
  }

  async function onAttach(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const ext = file.name.split(".").pop() || "mp3"
    await sendAudio(file, file.name, 0, ext)
  }

  return (
    <div className="screen home-min">
      <WaveHeader>
        <div className="topbar">
          <span style={{ width: 40 }} />
          <div className="title">controllerHub</div>
          <button className="icon-btn ghost" onClick={logout} title="Sair">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" />
            </svg>
          </button>
        </div>
        <div className="home-greet">Olá, {nome}</div>
        <div className="home-greet-sub">Pronto para gravar?</div>
      </WaveHeader>

      <div className="rec-stage">
        <button
          className={`big-record${recording ? " recording" : ""}`}
          onClick={recording ? stopRecording : startRecording}
          disabled={busy}
          aria-label={recording ? "Parar gravação" : "Gravar"}
        >
          {recording ? <span className="stop-square" /> : <Mic size={52} />}
        </button>
        <div className="rec-hint">
          {recording ? <span className="rec-timer-big">{fmt(secs)}</span>
            : busy ? "Processando..." : "Toque para gravar"}
        </div>
        {status && <p className="rec-status-msg">{status}</p>}
      </div>

      <div className="home-actions">
        <button className="action-btn" onClick={() => fileRef.current?.click()} disabled={busy}>
          <span className="ic"><Plus size={20} /></span>
          Anexar áudio
        </button>
        <input ref={fileRef} type="file" accept="audio/*" hidden onChange={onAttach} />

        <button className="action-btn primary" onClick={() => go("reports")}>
          <span className="ic"><FileText size={20} /></span>
          Relatórios
        </button>
      </div>
    </div>
  )
}
