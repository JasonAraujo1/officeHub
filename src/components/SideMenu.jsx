import { useState } from "react"
// Menu lateral retrátil (drawer) — fundo preto, itens nas cores das abas.
const COLORS = {
  home: "#b7ffa9",
  reports: "#ffc7ab",
  calendar: "#ebcefd",
  widgets: "#9fc8fe",
}

export default function SideMenu({ open, onClose, nome, go, logout, active = "home" }) {
  const navTo = (screen) => { onClose?.(); go?.(screen) }
  const [openFns, setOpenFns] = useState(false)

  const items = [
    { key: "home", label: "Início", icon: <><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></> },
    { key: "reports", label: "Relatórios", icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></> },
    { key: "calendar", label: "Calendário", icon: <><rect x="3" y="4.5" width="18" height="16" rx="3" /><path d="M3 9h18" /><path d="M8 2.5v4M16 2.5v4" /></> },
    { key: "widgets", label: "Funções", icon: <><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></> },
    { key: "profile", label: "Usuário", sub: true, icon: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></> },
    { key: "settings", label: "Configurações", sub: true, icon: <><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /><circle cx="9" cy="6" r="2" /><circle cx="15" cy="12" r="2" /><circle cx="8" cy="18" r="2" /></> },
    { key: "support", label: "Suporte", sub: true, icon: <><circle cx="12" cy="12" r="9" /><path d="M9.2 9.2a2.8 2.8 0 0 1 5.4 1c0 1.8-2.6 2.2-2.6 4" /><path d="M12 17.5h.01" /></> },
  ]

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(20,22,30,.5)",
          opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none",
          transition: "opacity .25s ease", zIndex: 60,
        }}
      />
      <aside
        style={{
          position: "fixed", top: 0, left: 0, bottom: 0, width: 280, maxWidth: "84vw",
          background: "#000", zIndex: 61, boxSizing: "border-box",
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform .25s ease", display: "flex", flexDirection: "column",
          borderRadius: "0 28px 28px 0", overflow: "hidden",
        }}
      >
        {/* cabeçalho do menu */}
        <div style={{ background: "#000", color: "#fff", padding: "28px 22px 22px" }}>
          <div style={{ fontWeight: 800, fontSize: 19, letterSpacing: "-0.3px" }}>Controlaí</div>
          <div style={{ color: "rgba(255,255,255,.5)", fontSize: 13, marginTop: 3, fontWeight: 600 }}>Olá, {nome}</div>
        </div>

        <nav style={{ padding: 12, flex: 1 }}>
          {items.filter((it) => !it.sub).map((it) => {
            const on = it.key === active
            const color = COLORS[it.key] || "#fff"
            const isFns = it.key === "widgets"
            return (
              <div key={it.key}>
                <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
                  <button
                    onClick={() => navTo(it.key)}
                    style={{
                      display: "flex", alignItems: "center", gap: 13, flex: 1,
                      padding: "14px 15px", border: "none", borderRadius: 16, cursor: "pointer",
                      background: on ? "rgba(255,255,255,.10)" : "transparent",
                      color, fontSize: 15, fontWeight: on ? 800 : 600, textAlign: "left",
                    }}
                  >
                    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{it.icon}</svg>
                    {it.label}
                  </button>
                  {isFns && (
                    <button
                      onClick={() => setOpenFns((v) => !v)}
                      aria-label={openFns ? "Recolher Funções" : "Expandir Funções"}
                      style={{ width: 40, height: 40, border: "none", background: "transparent", color: "#fff", cursor: "pointer", display: "grid", placeItems: "center", flex: "0 0 auto" }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: openFns ? "rotate(180deg)" : "none", transition: "transform .2s" }}>
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                  )}
                </div>

                {isFns && openFns && items.filter((s) => s.sub).map((s) => {
                  const son = s.key === active
                  return (
                    <button
                      key={s.key}
                      onClick={() => navTo(s.key)}
                      style={{
                        display: "flex", alignItems: "center", gap: 13, width: "100%",
                        padding: "11px 15px 11px 40px", border: "none", borderRadius: 16, cursor: "pointer",
                        background: son ? "rgba(255,255,255,.10)" : "transparent",
                        color: "#cfe2fe", fontSize: 14, fontWeight: son ? 800 : 600, textAlign: "left", marginBottom: 4,
                      }}
                    >
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{s.icon}</svg>
                      {s.label}
                    </button>
                  )
                })}
              </div>
            )
          })}
        </nav>

        <button
          onClick={() => { onClose?.(); logout?.() }}
          style={{
            display: "flex", alignItems: "center", gap: 13, width: "100%",
            padding: "18px 24px", border: "none", borderTop: "1px solid rgba(255,255,255,.1)",
            background: "transparent", color: "#f0bba1", fontSize: 15, fontWeight: 700,
            cursor: "pointer", textAlign: "left",
          }}
        >
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" />
          </svg>
          Sair
        </button>
      </aside>
    </>
  )
}
