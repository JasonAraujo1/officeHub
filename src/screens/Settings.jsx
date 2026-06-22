import { useEffect, useState } from "react"
import { Back, Shield, LogOut, UserPlus, Users, Check, X } from "../icons.jsx"
import { useAuth } from "../auth.jsx"
import { isSuperadmin } from "../lib/roles.js"
import {
  subscribeProfile, setController, inviteByEmail,
  subscribeIncoming, acceptInvite, declineInvite, subscribeConnections,
} from "../lib/team.js"

export default function Settings({ go }) {
  const { user, logout } = useAuth()
  const admin = isSuperadmin(user)
  const [profile, setProfile] = useState(null)
  const [incoming, setIncoming] = useState([])
  const [connections, setConnections] = useState([])
  const [email, setEmail] = useState("")
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const subs = []
    try { subs.push(subscribeProfile(setProfile)) } catch (e) { console.error(e) }
    try { subs.push(subscribeIncoming(setIncoming)) } catch (e) { console.error(e) }
    try { subs.push(subscribeConnections(setConnections)) } catch (e) { console.error(e) }
    return () => subs.forEach((u) => u && u())
  }, [])

  const isController = !!profile?.isController

  async function toggleController() {
    try { await setController(!isController) } catch (e) { console.error(e) }
  }
  async function invite() {
    setMsg(null); setBusy(true)
    try {
      const t = await inviteByEmail(email)
      setMsg({ ok: true, text: `Solicitação enviada para ${t.name}.` })
      setEmail("")
    } catch (e) {
      setMsg({ ok: false, text: e.message || "Erro ao enviar a solicitação." })
    } finally { setBusy(false) }
  }

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
        <div className="row-item">
          <span className="row-ic" style={{ color: "var(--c-green)" }}><Users size={18} /></span>
          <span className="row-label">Sou Controller</span>
          <span className={`switch${isController ? " on" : ""}`} role="switch" aria-checked={isController}
            tabIndex={0} onClick={toggleController}><i /></span>
        </div>
        <button className="row-item danger" onClick={logout}>
          <span className="row-ic"><LogOut size={18} /></span>
          <span className="row-label">Sair da conta</span>
        </button>
      </div>

      {/* Equipe — só para controllers */}
      {isController && (
        <>
          <div className="settings-section">Equipe</div>
          <div className="list-card" style={{ padding: 16 }}>
            <div className="row-label" style={{ marginBottom: 10 }}>Adicionar usuário pelo e-mail</div>
            <div className="invite-row">
              <input className="rec-title-input" value={email} onChange={(e) => setEmail(e.target.value)}
                type="email" placeholder="email@exemplo.com" />
              <button className="pill" style={{ borderRadius: 14 }} onClick={invite} disabled={busy}>
                <UserPlus size={18} />
              </button>
            </div>
            {msg && <p style={{ fontSize: 13, fontWeight: 600, color: msg.ok ? "var(--c-green)" : "#d23b3b" }}>{msg.text}</p>}
          </div>
        </>
      )}

      {/* Solicitações recebidas */}
      {incoming.length > 0 && (
        <>
          <div className="settings-section">Solicitações recebidas</div>
          <div className="list-card">
            {incoming.map((inv) => (
              <div className="row-item" key={inv.id}>
                <span className="row-ic"><UserPlus size={18} /></span>
                <span className="row-label">{inv.fromName}<br /><span className="row-label sub">{inv.fromEmail}</span></span>
                <button className="req-btn ok" onClick={() => acceptInvite(inv)} aria-label="Aceitar"><Check size={16} /></button>
                <button className="req-btn no" onClick={() => declineInvite(inv)} aria-label="Recusar"><X size={16} /></button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Conexões */}
      <div className="settings-section">Conexões {connections.length > 0 ? `(${connections.length})` : ""}</div>
      <div className="list-card">
        {connections.length === 0 ? (
          <div className="row-item static"><span className="row-label sub">Nenhuma conexão ainda.</span></div>
        ) : connections.map((c) => (
          <div className="row-item static" key={c.uid}>
            <span className="row-ic"><Users size={18} /></span>
            <span className="row-label">{c.name}<br /><span className="row-label sub">{c.email}</span></span>
          </div>
        ))}
      </div>

      {admin && (
        <>
          <div className="settings-section">Administração</div>
          <div className="list-card">
            <div className="row-item static">
              <span className="row-ic" style={{ color: "var(--c-purple)" }}><Shield size={18} /></span>
              <span className="row-label">Acesso de Superadmin ativo</span>
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
