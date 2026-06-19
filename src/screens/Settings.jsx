import { Back, Shield, LogOut } from "../icons.jsx"
import { useAuth } from "../auth.jsx"
import { isSuperadmin } from "../lib/roles.js"

export default function Settings({ go }) {
  const { user, logout } = useAuth()
  const admin = isSuperadmin(user)

  return (
    <div className="screen">
      <div className="topbar">
        <button className="round-btn" onClick={() => go("widgets")} aria-label="Voltar"><Back size={20} /></button>
        <div className="title center">Configurações</div>
        <span style={{ width: 44 }} />
      </div>

      <div className="settings-section">Conta</div>
      <div className="list-card">
        <div className="row-item static">
          <span className="row-label">E-mail</span>
          <span className="row-value">{user?.email || "—"}</span>
        </div>
        <div className="row-item static">
          <span className="row-label">Papel</span>
          <span className="row-value">{admin ? "Superadmin" : "Usuário"}</span>
        </div>
        <button className="row-item danger" onClick={logout}>
          <span className="row-ic"><LogOut size={18} /></span>
          <span className="row-label">Sair da conta</span>
        </button>
      </div>

      {admin && (
        <>
          <div className="settings-section">Administração</div>
          <div className="list-card">
            <div className="row-item static">
              <span className="row-ic" style={{ color: "var(--c-purple)" }}><Shield size={18} /></span>
              <span className="row-label">Acesso de Superadmin ativo</span>
            </div>
            <div className="row-item static">
              <span className="row-label sub">Você tem permissões administrativas. Ferramentas de gestão de usuários e dados podem ser adicionadas aqui.</span>
            </div>
          </div>
        </>
      )}

      <div className="settings-section">Aplicativo</div>
      <div className="list-card">
        <div className="row-item static">
          <span className="row-label">Versão</span>
          <span className="row-value">0.0.1</span>
        </div>
      </div>
    </div>
  )
}
