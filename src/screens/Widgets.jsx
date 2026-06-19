import { useState, useRef } from "react"
import { Mic, Plus, FileText, Calendar, Menu } from "../icons.jsx"
import SideMenu from "../components/SideMenu.jsx"
import { useAuth } from "../auth.jsx"

// Tela "Funções/widgets" — atalhos rápidos no mesmo estilo visual.
export default function Widgets({ go }) {
  const { user, logout } = useAuth()
  const nome = user?.displayName || user?.email?.split("@")[0] || "usuário"
  const [menu, setMenu] = useState(false)
  const fileRef = useRef()

  const items = [
    { key: "rec", label: "Nova gravação", sub: "Gravar e transcrever", cls: "mint", Icon: Mic, onClick: () => go("home") },
    { key: "att", label: "Anexar áudio", sub: "Enviar um arquivo", cls: "coral", Icon: Plus, onClick: () => go("home") },
    { key: "rep", label: "Relatórios", sub: "Ver análises", cls: "lilac", Icon: FileText, onClick: () => go("reports") },
    { key: "cal", label: "Calendário", sub: "Eventos e prazos", cls: "sky", Icon: Calendar, onClick: () => go("calendar") },
  ]

  return (
    <div className="screen has-nav">
      <SideMenu open={menu} onClose={() => setMenu(false)} nome={nome} go={go} logout={logout} active="widgets" />
      <div className="home-top">
        <h1 className="headline">Funções</h1>
        <button className="round-btn" onClick={() => setMenu(true)} aria-label="Menu"><Menu size={20} /></button>
      </div>
      <p className="auth-sub" style={{ marginTop: 6 }}>Atalhos rápidos do app.</p>

      <div className="stat-grid" style={{ marginTop: 8 }}>
        {items.map(({ key, label, sub, cls, Icon, onClick }) => (
          <button key={key} className={`stat-card ${cls}`} onClick={onClick}>
            <div className="stat-head"><span className="stat-ic"><Icon size={16} /></span></div>
            <div>
              <div className="stat-big" style={{ fontSize: 18 }}>{label}</div>
              <div className="stat-sub">{sub}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
