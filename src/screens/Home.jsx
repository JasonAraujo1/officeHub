import { useState, useEffect, useRef } from "react"
import { Mic, Plus, FileText } from "../icons.jsx"
import WaveHeader from "../components/WaveHeader.jsx"
import SideMenu from "../components/SideMenu.jsx"
import { useAuth } from "../auth.jsx"
import { createReport } from "../lib/reports.js"

function fmt(s) {
  const m = String(Math.floor(s / 60)).padStart(2, "0")
  const ss = String(s % 60).padStart(2, "0")
  return `${m}:${ss}`
}

const MAX_MIN = 90 // 1h30: limite de duração da gravação
const MAX_BYTES = 250 * 1024 * 1024 // ~1h30 de áudio em formatos comuns

export default function Home({ go }) {
  const { user, logout } = useAuth()
  const nome = user?.displayName || user?.email?.split("@")[0] || "usuário"
  const [recording, setRecording] = useState(false)
  const [paused, setPaused] = useState(false)
  const [secs, setSecs] = useState(0)
  const [status, setStatus] = useState(null) // texto de feedback
  const [busy, setBusy] = useState(false)
  const [menu, setMenu] = useState(false)

  const fileRef = useRef()
  const timer = useRef()
  const mediaRec = useRef(null)
  const chunks = useRef([])
  const secsRef = useRef(0) // espelha os segundos para calcular a duração no stop

  // O cronômetro só conta quando está gravando e NÃO está em pausa
  useEffect(() => {
    if (recording && !paused) {
      timer.current = setInterval(() => {
        setSecs((s) => {
          secsRef.current = s + 1
          return s + 1
        })
      }, 1000)
    } else {
      clearInterval(timer.current)
    }
    return () => clearInterval(timer.current)
  }, [recording, paused])

  // Para automaticamente ao atingir 1h30 de gravação
  useEffect(() => {
    if (recording && secs >= MAX_MIN * 60) stopRecording()
  }, [secs, recording])

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
        await sendAudio(blob, `Gravação ${new Date().toLocaleString("pt-BR")}`, secsRef.current)
      }
      mediaRec.current = rec
      secsRef.current = 0
      rec.start()
      setSecs(0)
      setPaused(false)
      setRecording(true)
    } catch (e) {
      setStatus("Não foi possível acessar o microfone.")
      console.error(e)
    }
  }

  function togglePause() {
    const rec = mediaRec.current
    if (!rec) return
    if (rec.state === "recording") {
      rec.pause()
      setPaused(true)
    } else if (rec.state === "paused") {
      rec.resume()
      setPaused(false)
    }
  }

  function stopRecording() {
    setRecording(false)
    setPaused(false)
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
      setStatus("Erro ao enviar o áudio. Tente novamente.")
      console.error(e)
    } finally {
      setBusy(false)
    }
  }

  async function onAttach(e) {
    const file = e.target.files?.[0]
    e.target.value = "" // permite reanexar o mesmo arquivo depois
    if (!file) return
    const ext = (file.name.split(".").pop() || "").toLowerCase()
    const audioExts = ["mp3", "wav", "m4a", "aac", "ogg", "oga", "opus", "webm", "flac", "mp4", "mpeg", "mpga", "aiff", "wma"]
    // alguns áudios chegam com file.type vazio — então aceitamos por extensão também
    const isAudio = file.type.startsWith("audio/") || audioExts.includes(ext)
    if (!isAudio) {
      setStatus("Selecione um arquivo de áudio válido.")
      return
    }
    if (file.size > MAX_BYTES) {
      setStatus("Áudio muito grande (máximo ~1h30).")
      return
    }
    await sendAudio(file, file.name, 0, ext || "mp3")
  }

  return (
    <div className="screen home-min">
      <SideMenu
        open={menu}
        onClose={() => setMenu(false)}
        nome={nome}
        go={go}
        logout={logout}
        active="home"
      />

      <WaveHeader>
        <div className="topbar">
          <button className="icon-btn ghost" onClick={() => setMenu(true)} title="Menu" aria-label="Abrir menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h18" />
            </svg>
          </button>
          <div className="title">controllerHub</div>
          <span style={{ width: 40 }} />
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
          {recording ? <span className="rec-timer-big">{fmt(secs)}{paused ? " · pausado" : ""}</span>
            : busy ? "Processando..." : "Toque para gravar"}
        </div>

        {recording && (
          <button className="pause-btn" onClick={togglePause}>
            {paused ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                Retomar
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" /><rect x="14" y="5" width="4" height="14" /></svg>
                Pausar
              </>
            )}
          </button>
        )}

        {status && <p className="rec-status-msg">{status}</p>}
      </div>

      <div className="home-actions">
        <button className="action-btn" onClick={() => fileRef.current?.click()} disabled={busy}>
          <span className="ic"><Plus size={20} /></span>
          Anexar áudio
        </button>
        <input ref={fileRef} type="file" accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.oga,.opus,.webm,.flac,.mp4,.mpeg,.mpga,.aiff,.wma" hidden onChange={onAttach} />

        <button className="action-btn primary" onClick={() => go("reports")}>
          <span className="ic"><FileText size={20} /></span>
          Relatórios
        </button>
      </div>
    </div>
  )
}
