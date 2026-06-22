// Menu lateral retrátil (drawer). Auto-contido com estilos inline para não
// depender da folha de estilo. Usado em Home (e pode ser reusado em outras telas).
const AMBER = "#e8554a" // salmão/vermelho (acento do app)

export default function SideMenu({ open, onClose, nome, go, logout, active = "home" }) {
  const navTo = (screen) => {
    onClose?.()
    go?.(screen)
  }

  const items = [
    { key: "home", label: "Início", icon: <path d="M3 11l9-8 9 8M5 10v10h14V10" /> },
    { key: "reports", label: "Relatórios", icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></> },
  ]

  return (
    <>
      {/* overlay escuro */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,.45)",
          opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none",
          transition: "opacity .25s ease", zIndex: 60,
        }}
      />
      {/* painel */}
      <aside
        style={{
          position: "fixed", top: 0, left: 0, bottom: 0, width: 270, maxWidth: "82vw",
          background: "#fff", zIndex: 61, boxSizing: "border-box",
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform .25s ease", display: "flex", flexDirection: "column",
        }}
      >
        {/* cabeçalho do menu */}
        <div style={{ background: "#111", color: "#fff", padding: "22px 20px 18px" }}>
          <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: ".2px" }}>Controlaí</div>
          <div style={{ color: AMBER, fontSize: 13, marginTop: 2 }}>Olá, {nome}</div>
        </div>

        {/* navegação */}
        <nav style={{ padding: 10, flex: 1 }}>
          {items.map((it) => {
            const on = it.key === active
            return (
              <button
                key={it.key}
                onClick={() => navTo(it.key)}
                style={{
                  display: "flex", alignItems: "center", gap: 12, width: "100%",
                  padding: "13px 14px", border: "none", borderRadius: 10, cursor: "pointer",
                  background: on ? "#fdeae6" : "transparent",
                  color: on ? AMBER : "#222", fontSize: 15, fontWeight: on ? 600 : 500,
                  textAlign: "left",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {it.icon}
                </svg>
                {it.label}
              </button>
            )
          })}
        </nav>

        {/* rodapé: sair */}
        <button
          onClick={() => { onClose?.(); logout?.() }}
          style={{
            display: "flex", alignItems: "center", gap: 12, width: "100%",
            padding: "16px 24px", border: "none", borderTop: "1px solid #eee",
            background: "transparent", color: "#c0392b", fontSize: 15, fontWeight: 500,
            cursor: "pointer", textAlign: "left",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" />
          </svg>
          Sair
        </button>
      </aside>
    </>
  )
}
