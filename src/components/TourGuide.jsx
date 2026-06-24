import { useEffect, useState } from "react"

// Tour guiado multi-tela. Cada passo: { screen, selector, title, body }.
// Navega pela app via go(screen) e destaca o elemento [data-tour].
export default function TourGuide({ steps, go, currentScreen, onFinish }) {
  const [i, setI] = useState(0)
  const [rect, setRect] = useState(null)   // DOMRect | "center" | null
  const step = steps[i]

  // garante que estamos na tela do passo atual
  useEffect(() => {
    if (step && currentScreen !== step.screen) go(step.screen)
  }, [i, step, currentScreen, go])

  // localiza o alvo (com polling, por causa das transições/carregamentos)
  useEffect(() => {
    if (!step) return
    let raf, tries = 0, cancelled = false
    setRect(null)
    const find = () => {
      if (cancelled) return
      if (currentScreen !== step.screen) { raf = requestAnimationFrame(find); return }
      const el = step.selector ? document.querySelector(step.selector) : null
      if (el) {
        const r0 = el.getBoundingClientRect()
        if (r0.width && r0.height) {
          el.scrollIntoView({ block: "center", behavior: "smooth" })
          setTimeout(() => { if (!cancelled) setRect(el.getBoundingClientRect()) }, 280)
          return
        }
      }
      if (tries++ < 150) raf = requestAnimationFrame(find)  // ~2.5s
      else setRect("center")
    }
    raf = requestAnimationFrame(find)
    return () => { cancelled = true; cancelAnimationFrame(raf) }
  }, [i, step, currentScreen])

  // reposiciona em scroll/resize
  useEffect(() => {
    if (!step?.selector) return
    const update = () => {
      const el = document.querySelector(step.selector)
      if (el) { const r = el.getBoundingClientRect(); if (r.width) setRect(r) }
    }
    window.addEventListener("resize", update)
    window.addEventListener("scroll", update, true)
    return () => { window.removeEventListener("resize", update); window.removeEventListener("scroll", update, true) }
  }, [step])

  if (!step) return null

  const last = i === steps.length - 1
  const next = () => last ? onFinish() : setI(i + 1)
  const prev = () => setI((n) => Math.max(0, n - 1))

  const hasRect = rect && rect !== "center"
  const pad = 8
  const hole = hasRect ? {
    top: rect.top - pad, left: rect.left - pad,
    width: rect.width + pad * 2, height: rect.height + pad * 2,
  } : null

  const vw = window.innerWidth, vh = window.innerHeight
  const pw = Math.min(330, vw - 32)
  let popTop, popLeft
  if (hasRect) {
    popLeft = Math.min(Math.max(16, rect.left), vw - pw - 16)
    const below = rect.top + rect.height + pad + 12
    const estH = 168
    popTop = (below + estH < vh) ? below : Math.max(16, rect.top - pad - estH - 12)
  } else {
    popLeft = vw / 2 - pw / 2
    popTop = vh / 2 - 90
  }

  return (
    <div className="tour-root">
      {/* bloqueia interações com a UI por baixo */}
      <div className="tour-block" onClick={(e) => e.stopPropagation()} />
      {hole
        ? <div className="tour-hole" style={{ top: hole.top, left: hole.left, width: hole.width, height: hole.height }} />
        : <div className="tour-dim" />}
      <div className="tour-pop" style={{ top: popTop, left: popLeft, width: pw }}>
        <div className="tour-step">{i + 1} de {steps.length}</div>
        <div className="tour-title">{step.title}</div>
        <div className="tour-body">{step.body}</div>
        <div className="tour-actions">
          <button className="tour-skip" onClick={onFinish}>Pular</button>
          <div style={{ display: "flex", gap: 8 }}>
            {i > 0 && <button className="tour-btn ghost" onClick={prev}>Anterior</button>}
            <button className="tour-btn" onClick={next}>{last ? "Concluir" : "Próximo"}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
