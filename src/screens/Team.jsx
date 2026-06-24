import { useEffect, useState } from "react"
import { Back, Users, UserPlus, Check, X, Pencil } from "../icons.jsx"
import { useAuth } from "../auth.jsx"
import { isSuperadmin, TEAM_ROLES } from "../lib/roles.js"
import {
  subscribeProfile, subscribeConnections, subscribeIncoming,
  inviteByEmail, acceptInvite, declineInvite, updateConnectionRole,
} from "../lib/team.js"

// Seletor de cargo: dropdown com cargos pré-definidos + "Outros" (texto manual).
function RoleField({ value, onChange, autoFocus }) {
  const initialOther = value !== "" && !TEAM_ROLES.includes(value)
  const [mode, setMode] = useState(initialOther ? "Outros" : value)
  return (
    <>
      <select className="rec-title-input" value={mode}
        onChange={(e) => { const v = e.target.value; setMode(v); onChange(v === "Outros" ? "" : v) }}
        style={{ width: "100%" }}>
        <option value="">Selecione a função…</option>
        {TEAM_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
      </select>
      {mode === "Outros" && (
        <input className="rec-title-input" value={value} autoFocus={autoFocus}
          onChange={(e) => onChange(e.target.value)} placeholder="Digite o cargo"
          style={{ width: "100%", marginTop: 8 }} />
      )}
    </>
  )
}

export default function Team({ go }) {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [conns, setConns] = useState([])
  const [incoming, setIncoming] = useState([])
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("")
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)
  const [editing, setEditing] = useState(null)   // uid em edição
  const [editRole, setEditRole] = useState("")

  useEffect(() => {
    const subs = []
    try { subs.push(subscribeProfile(setProfile)) } catch (e) { console.error(e) }
    try { subs.push(subscribeConnections(setConns)) } catch (e) { console.error(e) }
    try { subs.push(subscribeIncoming(setIncoming)) } catch (e) { console.error(e) }
    return () => subs.forEach((u) => u && u())
  }, [])

  const canManage = isSuperadmin(user) || !!profile?.isController

  async function invite() {
    setMsg(null); setBusy(true)
    try {
      const t = await inviteByEmail(email, role)
      setMsg({ ok: true, text: `Convite enviado para ${t.name}${role.trim() ? ` (${role.trim()})` : ""}.` })
      setEmail(""); setRole("")
    } catch (e) {
      setMsg({ ok: false, text: e.message || "Erro ao enviar o convite." })
    } finally { setBusy(false) }
  }

  function startEdit(c) { setEditing(c.uid); setEditRole(c.role || "") }
  async function saveEdit(c) {
    try { await updateConnectionRole(c.uid, editRole) } catch (e) { console.error(e) }
    setEditing(null)
  }

  return (
    <div className="screen fn-sub-screen team-screen">
      <div className="topbar">
        <button className="round-btn" onClick={() => go("widgets")} aria-label="Voltar"><Back size={20} /></button>
        <div className="title center">Minha equipe</div>
        <span style={{ width: 44 }} />
      </div>

      {/* Convites recebidos (qualquer usuário) */}
      {incoming.length > 0 && (
        <>
          <div className="settings-section">Convites recebidos</div>
          <div className="list-card">
            {incoming.map((inv) => (
              <div className="row-item" key={inv.id}>
                <span className="row-ic"><UserPlus size={18} /></span>
                <span className="row-label">{inv.fromName} te convidou<br /><span className="row-label sub">{inv.role ? `Função: ${inv.role}` : inv.fromEmail}</span></span>
                <button className="req-btn ok" onClick={() => acceptInvite(inv)} aria-label="Aceitar"><Check size={16} /></button>
                <button className="req-btn no" onClick={() => declineInvite(inv)} aria-label="Recusar"><X size={16} /></button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Adicionar pessoa — só controller */}
      {canManage && (
        <>
          <div className="settings-section">Adicionar à equipe</div>
          <div className="list-card" style={{ padding: 16 }}>
            <div className="row-label" style={{ marginBottom: 10 }}>Convide por e-mail e designe a função</div>
            <RoleField value={role} onChange={setRole} />
            <div className="invite-row" style={{ marginTop: 8 }}>
              <input className="rec-title-input" value={email} onChange={(e) => setEmail(e.target.value)}
                type="email" placeholder="email@exemplo.com" />
              <button className="pill" style={{ borderRadius: 14 }} onClick={invite} disabled={busy}>
                <UserPlus size={18} />
              </button>
            </div>
            {msg && <p style={{ fontSize: 13, fontWeight: 600, margin: "8px 0 0", color: msg.ok ? "var(--c-green)" : "#d23b3b" }}>{msg.text}</p>}
          </div>
        </>
      )}

      {/* Lista da equipe */}
      <div className="settings-section">Equipe {conns.length ? `(${conns.length})` : ""}</div>
      {conns.length === 0 ? (
        <p className="rec-status-msg" style={{ margin: "20px auto" }}>
          {canManage ? "Nenhuma pessoa na equipe. Adicione acima." : "Você ainda não faz parte de uma equipe."}
        </p>
      ) : (
        <div className="list-card">
          {conns.map((c) => (
            <div className="row-item static" key={c.uid} style={editing === c.uid ? { flexWrap: "wrap", rowGap: 8 } : undefined}>
              <span className="row-ic"><Users size={18} /></span>
              {editing === c.uid ? (
                <>
                  <span className="row-label" style={{ flexBasis: "100%" }}>{c.name}</span>
                  <div style={{ flex: 1, minWidth: 0 }}><RoleField value={editRole} onChange={setEditRole} autoFocus /></div>
                  <button className="req-btn ok" onClick={() => saveEdit(c)} aria-label="Salvar"><Check size={16} /></button>
                  <button className="req-btn no" onClick={() => setEditing(null)} aria-label="Cancelar"><X size={16} /></button>
                </>
              ) : (
                <>
                  <span className="row-label">{c.name}<br /><span className="row-label sub">{c.email}</span></span>
                  {c.role ? <span className="person-chip">{c.role}</span> : null}
                  {canManage && (
                    <button className="req-btn" onClick={() => startEdit(c)} aria-label="Editar função"><Pencil size={15} /></button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
