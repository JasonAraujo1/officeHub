import { Back, Shield, LogOut, Gear } from "../icons.jsx"
import { useAuth } from "../auth.jsx"
import { isSuperadmin, roleLabel } from "../lib/roles.js"

export default function Profile({ go }) {
  const { user, logout } = useAuth()
  const nome = user?.displayName || user?.email?.split("@")[0] || "usuário"
  const inicial = nome.charAt(0).toUpperCase()
  const admin = isSuperadmin(user)

  return (
    <div className="screen fn-sub-screen">
      <div className="topbar">
        <button className="round-btn" onClick={() => go("widgets")} aria-label="Voltar"><Back size={20} /></button>
        <div className="title center">Perfil</div>
        <span style={{ width: 44 }} />
      </div>

      <div className="profile-head">
        <div className="profile-avatar">{inicial}</div>
        <div className="profile-name">{nome}</div>
        <div className="profile-email">{user?.email}</div>
        <div className={`role-badge${admin ? " admin" : ""}`}>
          {admin && <Shield size={14} />} {roleLabel(user)}
        </div>
      </div>

      <div className="list-card">
        <button className="row-item" onClick={() => go("settings")}>
          <span className="row-ic"><Gear size={18} /></span>
          <span className="row-label">Configurações</span>
        </button>
        <button className="row-item danger" onClick={logout}>
          <span className="row-ic"><LogOut size={18} /></span>
          <span className="row-label">Sair</span>
        </button>
      </div>
    </div>
  )
}
