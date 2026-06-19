import { useEffect, useMemo, useRef, useState } from "react"

// Player de áudio no estilo Google Recorder: waveform clicável (tan/azul),
// tempos e barra de controles CIRCULARES (voltar 5s · play/pause salmão · avançar 10s).
const CENTER_BG = "#181a20"   // botão central (escuro)
const CENTER_IC = "#ffffff"
const SIDE_BG = "#f6f6f8"     // botões laterais (claro)
const SIDE_IC = "#16171d"
const WAVE_PLAYED = "#181a20" // parte tocada (escuro)
const WAVE_REST = "#e4e2ea"   // restante (cinza claro)

function fmt(s) {
  if (!isFinite(s) || s < 0) return "0:00"
  const m = Math.floor(s / 60)
  const ss = String(Math.floor(s % 60)).padStart(2, "0")
  return `${m}:${ss}`
}

export default function AudioPlayer({ src }) {
  const audio = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [cur, setCur] = useState(0)
  const [dur, setDur] = useState(0)

  useEffect(() => {
    const a = audio.current
    if (!a) return
    const onTime = () => setCur(a.currentTime)
    const onMeta = () => setDur(a.duration || 0)
    const onEnd = () => { setPlaying(false); setCur(0) }
    a.addEventListener("timeupdate", onTime)
    a.addEventListener("loadedmetadata", onMeta)
    a.addEventListener("ended", onEnd)
    return () => {
      a.removeEventListener("timeupdate", onTime)
      a.removeEventListener("loadedmetadata", onMeta)
      a.removeEventListener("ended", onEnd)
    }
  }, [src])

  const toggle = () => {
    const a = audio.current
    if (!a) return
    if (a.paused) { a.play(); setPlaying(true) }
    else { a.pause(); setPlaying(false) }
  }
  const skip = (d) => {
    const a = audio.current
    if (!a) return
    const total = dur || a.duration || 0
    a.currentTime = Math.min(Math.max(0, a.currentTime + d), total)
  }
  const seek = (e) => {
    const a = audio.current
    if (!a || !dur) return
    const r = e.currentTarget.getBoundingClientRect()
    const p = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
    a.currentTime = p * dur
    setCur(p * dur)
  }

  const pct = dur ? cur / dur : 0
  const heights = useMemo(
    () => Array.from({ length: 60 }, (_, i) =>
      14 + Math.round(Math.abs(Math.sin(i * 0.8) * 0.55 + Math.sin(i * 0.31) * 0.45) * 64)),
    []
  )
  const playedBars = Math.round(pct * heights.length)

  const sideBtn = {
    width: 60, height: 60, borderRadius: "50%", border: "none", cursor: "pointer",
    background: SIDE_BG, color: SIDE_IC, display: "grid", placeItems: "center", flex: "0 0 auto",
  }

  return (
    <div style={{ margin: "4px 0 24px" }}>
      <audio ref={audio} src={src} preload="metadata" />

      {/* waveform (clicável para buscar) */}
      <div
        onClick={seek}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 3,
          height: 150, cursor: "pointer", padding: "0 4px",
        }}
      >
        {heights.map((h, i) => (
          <span key={i} style={{
            flex: 1, height: h, borderRadius: 4, minWidth: 2,
            background: i < playedBars ? WAVE_PLAYED : WAVE_REST,
          }} />
        ))}
      </div>

      {/* tempos */}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--ink-soft)", fontVariantNumeric: "tabular-nums", margin: "14px 4px 18px" }}>
        <span>{fmt(cur)}</span>
        <span>-{fmt(Math.max(0, dur - cur))}</span>
      </div>

      {/* controles circulares */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 26 }}>
        <button style={sideBtn} onClick={() => skip(-5)} title="Voltar 5s" aria-label="Voltar 5 segundos">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 7L6 12l5 5" /><path d="M18 7l-5 5 5 5" />
          </svg>
        </button>

        <button
          onClick={toggle}
          title={playing ? "Pausar" : "Reproduzir"}
          aria-label={playing ? "Pausar" : "Reproduzir"}
          style={{
            width: 84, height: 84, borderRadius: "50%", border: "none", cursor: "pointer",
            background: CENTER_BG, color: CENTER_IC, display: "grid", placeItems: "center", flex: "0 0 auto",
          }}
        >
          {playing ? (
            <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
          ) : (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
          )}
        </button>

        <button style={sideBtn} onClick={() => skip(10)} title="Avançar 10s" aria-label="Avançar 10 segundos">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 7l5 5-5 5" /><path d="M6 7l5 5-5 5" />
          </svg>
        </button>
      </div>
    </div>
  )
}
