import { useState } from "react"
import { Mic, Plus, FileText, Calendar, Menu, User, Gear, Shield, Help } from "../icons.jsx"
import SideMenu from "../components/SideMenu.jsx"
import { useAuth } from "../auth.jsx"
import { isSuperadmin, roleLabel } from "../lib/roles.js"

export default function Widgets({ go }) {
  const { user, logout } = useAuth()
  const nome = user?.displayName || user?.email?.split("@")[0] || "usuário"
  const inicial = nome.charAt(0).toUpperCase()
  const admin = isSuperadmin(user)
  const [menu, setMenu] = useState(false)

  const shortcuts = [
    { key: "rec", label: "Nova gravação", sub: "Gravar e transcrever", cls: "mint", Icon: Mic, onClick: () => go("record") },
    { key: "att", label: "Anexar áudio", sub: "Enviar um arquivo", cls: "coral", Icon: Plus, onClick: () => go("attach") },
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

      {/* widget de usuário */}
      <button className="user-widget" onClick={() => go("profile")}>
        <div className="user-widget-avatar">{inicial}</div>
        <div className="user-widget-info">
          <div className="user-widget-name">{nome}</div>
          <div className="user-widget-email">{user?.email}</div>
        </div>
        <div className={`role-badge${admin ? " admin" : ""}`}>
          {admin && <Shield size={13} />} {roleLabel(user)}
        </div>
      </button>

      {/* widget de configurações */}
      <button className="config-widget" onClick={() => go("settings")}>
        <span className="config-ic"><Gear size={20} /></span>
        <span className="config-label">Configurações</span>
        <span className="config-sub">Conta, papel e preferências</span>
      </button>

      {/* widget de suporte */}
      <button className="config-widget" onClick={() => go("support")}>
        <span className="config-ic" style={{ background: "var(--c-purple)" }}><Help size={20} /></span>
        <span className="config-label">Suporte</span>
        <span className="config-sub">Ajuda, contato e dúvidas</span>
      </button>

      <div className="settings-section">Atalhos</div>
      <div className="stat-grid">
        {shortcuts.map(({ key, label, sub, cls, Icon, onClick }) => (
          <button key={key} className={`stat-card ${cls}`} onClick={onClick}>
            <div className="stat-head"><span className="stat-ic"><Icon size={16} /></span></div>
            <div>
              <div className="stat-big" style={{ fontSize: 17 }}>{label}</div>
              <div className="stat-sub">{sub}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
