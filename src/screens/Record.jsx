import { useState, useEffect, useRef } from "react"
import { Back, Pause, Play, Check, X, Mic } from "../icons.jsx"
import AudioPlayer from "../components/AudioPlayer.jsx"
import { createReport } from "../lib/reports.js"

function fmt(s) {
  const m = String(Math.floor(s / 60)).padStart(2, "0")
  const ss = String(s % 60).padStart(2, "0")
  return `${m}:${ss}`
}

const MAX_MIN = 90

export default function Record({ go }) {
  const [phase, setPhase] = useState("rec")      // 'rec' | 'review'
  const [recording, setRecording] = useState(false)
  const [paused, setPaused] = useState(false)
  const [secs, setSecs] = useState(0)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const [title, setTitle] = useState("")

  const timer = useRef()
  const mediaRec = useRef(null)
  const streamRef = useRef(null)
  const chunks = useRef([])
  const blobRef = useRef(null)
  const secsRef = useRef(0)
  const canceled = useRef(false)

  const canvasRef = useRef(null)
  const audioCtxRef = useRef(null)
  const analyserRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    start()
    return cleanupAll
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (recording && !paused) {
      timer.current = setInterval(() => setSecs((s) => { secsRef.current = s + 1; return s + 1 }), 1000)
    } else clearInterval(timer.current)
    return () => clearInterval(timer.current)
  }, [recording, paused])

  useEffect(() => { if (recording && secs >= MAX_MIN * 60) finish() }, [secs, recording])

  function cleanupAll() {
    clearInterval(timer.current)
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    try { audioCtxRef.current?.close() } catch {}
    try { streamRef.current?.getTracks().forEach((t) => t.stop()) } catch {}
  }

  async function start() {
    setStatus(null)
    canceled.current = false
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const rec = new MediaRecorder(stream)
      chunks.current = []
      rec.ondataavailable = (e) => e.data.size && chunks.current.push(e.data)
      rec.onstop = () => {
        if (canceled.current) return
        const blob = new Blob(chunks.current, { type: rec.mimeType || "audio/webm" })
        blobRef.current = blob
        setAudioUrl(URL.createObjectURL(blob))
        setTitle(`Gravação ${new Date().toLocaleString("pt-BR")}`)
        setPhase("review")
      }
      mediaRec.current = rec
      secsRef.current = 0
      rec.start(); setSecs(0); setPaused(false); setRecording(true)

      // analisador para a forma de onda em tempo real
      const Ctx = window.AudioContext || window.webkitAudioContext
      const actx = new Ctx()
      audioCtxRef.current = actx
      try { await actx.resume() } catch {}
      const source = actx.createMediaStreamSource(stream)
      const analyser = actx.createAnalyser()
      analyser.fftSize = 128
      analyser.smoothingTimeConstant = 0.75
      source.connect(analyser)
      analyserRef.current = analyser
      drawWave()
    } catch (e) {
      setStatus("Não foi possível acessar o microfone.")
      console.error(e)
    }
  }

  function drawWave() {
    const canvas = canvasRef.current
    const analyser = analyserRef.current
    if (!canvas || !analyser) { rafRef.current = requestAnimationFrame(drawWave); return }
    const ctx = canvas.getContext("2d")
    const w = canvas.width, h = canvas.height
    const bins = 36
    const data = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(data)
    ctx.clearRect(0, 0, w, h)
    const step = w / bins
    const bw = step * 0.55
    for (let i = 0; i < bins; i++) {
      const v = data[Math.floor(i * analyser.frequencyBinCount / bins)] / 255
      const bh = Math.max(6, v * h * 0.95)
      const x = i * step + (step - bw) / 2
      const y = (h - bh) / 2
      ctx.fillStyle = "#16171d"
      const r = bw / 2
      ctx.beginPath()
      if (ctx.roundRect) ctx.roundRect(x, y, bw, bh, r)
      else ctx.rect(x, y, bw, bh)
      ctx.fill()
    }
    rafRef.current = requestAnimationFrame(drawWave)
  }

  function togglePause() {
    const rec = mediaRec.current
    if (!rec) return
    if (rec.state === "recording") { rec.pause(); setPaused(true) }
    else if (rec.state === "paused") { rec.resume(); setPaused(false) }
  }

  function finish() {
    if (!mediaRec.current) return
    setRecording(false); setPaused(false)
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    try { audioCtxRef.current?.close() } catch {}
    mediaRec.current.stop()
    streamRef.current?.getTracks().forEach((t) => t.stop())
  }

  function cancel() {
    canceled.current = true
    setRecording(false)
    cleanupAll()
    try { mediaRec.current?.stop() } catch {}
    go("home")
  }

  function rerecord() {
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioUrl(null); blobRef.current = null
    setSecs(0); secsRef.current = 0
    setStatus(null); setPhase("rec")
    start()
  }

  async function send() {
    if (!blobRef.current) return
    setBusy(true); setStatus("Enviando áudio para análise...")
    try {
      await createReport(blobRef.current, { title: title || "Gravação", durationSec: secsRef.current, ext: "webm" })
      setStatus("Áudio enviado!")
      setTimeout(() => go("reports"), 700)
    } catch (e) {
      setStatus("Erro ao enviar o áudio. Tente novamente.")
      console.error(e)
    } finally { setBusy(false) }
  }

  return (
    <div className="screen rec-screen">
      <div className="topbar">
        <button className="round-btn" onClick={cancel} aria-label="Cancelar"><Back size={20} /></button>
        <div className="title center">{phase === "review" ? "Revisar gravação" : "Gravação"}</div>
        <span style={{ width: 44 }} />
      </div>

      {phase === "rec" ? (
        <>
          <div className="rec-stage">
            <div className="rec-status">
              <span className="dot"><i />{paused ? "Pausado" : recording ? "Gravando…" : "Iniciando…"}</span>
            </div>
            <div className="rec-timer">{fmt(secs)}</div>
            <canvas ref={canvasRef} className="rec-canvas" width="640" height="150" />
            {status && <p className="rec-status-msg">{status}</p>}
          </div>

          <div className="rec-controls">
            <button className="side" onClick={cancel} aria-label="Cancelar"><X /></button>
            <button className="rec-main" onClick={togglePause} disabled={!recording} aria-label={paused ? "Retomar" : "Pausar"}>
              {paused ? <Play size={30} /> : <Pause size={30} />}
            </button>
            <button className="side confirm" onClick={finish} disabled={!recording} aria-label="Concluir"><Check /></button>
          </div>
        </>
      ) : (
        <div className="rec-review">
          <div className="rec-timer" style={{ fontSize: 30, margin: "6px 0" }}>{fmt(secs)}</div>
          {audioUrl && <AudioPlayer src={audioUrl} />}

          <label className="field">
            <span>Título</span>
            <input className="rec-title-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título da gravação" />
          </label>

          {status && <p className="rec-status-msg" style={{ margin: "4px auto" }}>{status}</p>}

          <div className="rec-review-actions">
            <button className="pill ghost" onClick={rerecord} disabled={busy}><Mic size={18} /> Regravar</button>
            <button className="pill" onClick={send} disabled={busy}><Check size={18} /> {busy ? "Enviando…" : "Enviar"}</button>
          </div>
        </div>
      )}
    </div>
  )
}
