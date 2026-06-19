// Menu lateral retrátil (drawer), no novo estilo claro.
export default function SideMenu({ open, onClose, nome, go, logout, active = "home" }) {
  const navTo = (screen) => { onClose?.(); go?.(screen) }

  const items = [
    { key: "home", label: "Início", icon: <><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></> },
    { key: "reports", label: "Relatórios", icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></> },
    { key: "calendar", label: "Calendário", icon: <><rect x="3" y="4.5" width="18" height="16" rx="3" /><path d="M3 9h18" /><path d="M8 2.5v4M16 2.5v4" /></> },
    { key: "widgets", label: "Funções", icon: <><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></> },
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
          background: "#fff", zIndex: 61, boxSizing: "border-box",
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform .25s ease", display: "flex", flexDirection: "column",
          borderRadius: "0 28px 28px 0", overflow: "hidden",
        }}
      >
        <div style={{ background: "var(--dark)", color: "#fff", padding: "26px 22px 22px" }}>
          <div style={{ fontWeight: 800, fontSize: 19, letterSpacing: "-0.3px" }}>controllerHub</div>
          <div style={{ color: "#9aa0ab", fontSize: 13, marginTop: 3, fontWeight: 600 }}>Olá, {nome}</div>
        </div>

        <nav style={{ padding: 12, flex: 1 }}>
          {items.map((it) => {
            const on = it.key === active
            return (
              <button
                key={it.key}
                onClick={() => navTo(it.key)}
                style={{
                  display: "flex", alignItems: "center", gap: 13, width: "100%",
                  padding: "14px 15px", border: "none", borderRadius: 16, cursor: "pointer",
                  background: on ? "var(--mint-soft)" : "transparent",
                  color: "var(--ink)", fontSize: 15, fontWeight: on ? 800 : 600,
                  textAlign: "left", marginBottom: 4,
                }}
              >
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {it.icon}
                </svg>
                {it.label}
              </button>
            )
          })}
        </nav>

        <button
          onClick={() => { onClose?.(); logout?.() }}
          style={{
            display: "flex", alignItems: "center", gap: 13, width: "100%",
            padding: "18px 24px", border: "none", borderTop: "1px solid var(--line)",
            background: "transparent", color: "#d23b3b", fontSize: 15, fontWeight: 700,
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
