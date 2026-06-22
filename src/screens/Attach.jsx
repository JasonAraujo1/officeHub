import { useEffect, useRef, useState } from "react"
import { Back, Paperclip, Play } from "../icons.jsx"
import { createReport } from "../lib/reports.js"

const MAX_BYTES = 250 * 1024 * 1024
const AUDIO_EXTS = ["mp3", "wav", "m4a", "aac", "ogg", "oga", "opus", "webm", "flac", "mp4", "mpeg", "mpga", "aiff", "wma"]

export default function Attach({ go }) {
  const fileRef = useRef()
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState(null)

  useEffect(() => { fileRef.current?.click() }, [])

  function onPick(e) {
    const f = e.target.files?.[0]
    e.target.value = ""
    if (!f) return
    const ext = (f.name.split(".").pop() || "").toLowerCase()
    const isAudio = f.type.startsWith("audio/") || AUDIO_EXTS.includes(ext)
    if (!isAudio) { setStatus("Selecione um arquivo de áudio válido."); return }
    if (f.size > MAX_BYTES) { setStatus("Áudio muito grande (máximo ~1h30)."); return }
    setStatus(null); setFile(f)
  }

  async function send() {
    if (!file) return
    const ext = (file.name.split(".").pop() || "mp3").toLowerCase()
    setBusy(true); setStatus("Enviando áudio para análise...")
    try {
      await createReport(file, { title: file.name, durationSec: 0, ext })
      setStatus("Áudio enviado!")
      setTimeout(() => go("reports"), 700)
    } catch (e) {
      setStatus("Erro ao enviar o áudio. Tente novamente.")
      console.error(e)
    } finally { setBusy(false) }
  }

  return (
    <div className="screen attach-screen">
      <div className="topbar">
        <button className="round-btn" onClick={() => go("home")} aria-label="Voltar"><Back size={20} /></button>
        <div className="title center">Anexar áudio</div>
        <span style={{ width: 44 }} />
      </div>

      <button className="attach-drop" onClick={() => fileRef.current?.click()}>
        <span className="attach-ic"><Paperclip size={26} /></span>
        <span className="attach-title">{file ? file.name : "Escolher arquivo de áudio"}</span>
        <span className="attach-sub">{file ? "Toque para trocar o arquivo" : "mp3, wav, m4a, ogg…"}</span>
      </button>

      <input ref={fileRef} type="file" hidden onChange={onPick}
        accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.oga,.opus,.webm,.flac,.mp4,.mpeg,.mpga,.aiff,.wma" />

      {status && <p className="rec-status-msg" style={{ margin: "14px auto" }}>{status}</p>}

      {file && (
        <button className="btn-primary" onClick={send} disabled={busy}>
          <Play size={18} /> {busy ? "Enviando…" : "Enviar para análise"}
        </button>
      )}
    </div>
  )
}
