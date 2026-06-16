import { useState, useEffect, useRef } from "react"
import { Grid, User, X, Check, Pause, Play, Chevron, Bookmark } from "../icons.jsx"
import Waveform from "../components/Waveform.jsx"
import WaveHeader from "../components/WaveHeader.jsx"

function fmt(s) {
  const m = String(Math.floor(s / 60)).padStart(2, "0")
  const ss = String(s % 60).padStart(2, "0")
  return `00:${m}:${ss}`
}

export default function Record({ go }) {
  const [running, setRunning] = useState(true)
  const [secs, setSecs] = useState(84)
  const ref = useRef()

  useEffect(() => {
    if (!running) return
    ref.current = setInterval(() => setSecs((s) => s + 1), 1000)
    return () => clearInterval(ref.current)
  }, [running])

  return (
    <div className="screen">
      <WaveHeader compact>
        <div className="topbar">
          <button className="icon-btn ghost"><Grid /></button>
          <div className="title">Gravar</div>
          <button className="icon-btn ghost"><User /></button>
        </div>
      </WaveHeader>

      <div className="rec-status">
        <span className="dot"><i />{running ? "Gravando..." : "Pausado"}</span>
      </div>
      <div className="rec-timer">{fmt(secs)}</div>

      <div className="rec-wave">
        <Waveform count={52} height={110} played={0.6} color="var(--accent)" seed={3} />
        <span className="cursor" style={{ left: "58%" }} />
      </div>

      <button className="quality">Alta qualidade <Chevron size={16} /></button>

      <div className="rec-controls">
        <button className="side" onClick={() => go("attachments")} aria-label="Cancelar"><X /></button>
        <button className="rec-main" onClick={() => setRunning((r) => !r)}>
          {running ? <Pause size={30} /> : <Play size={30} />}
        </button>
        <button className="side confirm" onClick={() => go("transcription")} aria-label="Concluir"><Check /></button>
      </div>

      <div className="card flat mark-card">
        <div className="body">
          <div className="label">Marcações</div>
          <div className="time">01:15</div>
          <div className="desc">Ponto importante sobre o projeto</div>
        </div>
        <Bookmark filled size={20} />
      </div>
    </div>
  )
}
