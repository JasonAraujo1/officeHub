import { useEffect, useRef, useState } from "react"

// Dropdown customizado (substitui o <select> nativo): arredondado, sem borda,
// fundo fosco translúcido, lista estilizável. Sem dependências externas.
export default function Select({ value, options, onChange, ariaLabel, align = "left" }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [])

  const cur = options.find((o) => o.value === value)

  return (
    <div className="msel" ref={ref}>
      <button type="button" className="msel-btn" onClick={() => setOpen((v) => !v)} aria-label={ariaLabel} aria-haspopup="listbox" aria-expanded={open}>
        {cur?.label ?? "—"}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .18s" }}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className={`msel-pop ${align}`} role="listbox">
          {options.map((o) => (
            <button key={o.value} type="button" role="option" aria-selected={o.value === value}
              className={`msel-opt${o.value === value ? " active" : ""}`}
              onClick={() => { onChange(o.value); setOpen(false) }}>
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
