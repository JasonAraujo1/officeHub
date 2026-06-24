import { useEffect, useState } from "react"
import { Back, Shield, LogOut, Users, Bell, FileText } from "../icons.jsx"
import { useAuth } from "../auth.jsx"
import { isSuperadmin } from "../lib/roles.js"
import { enablePush, pushStatus } from "../lib/push.js"
import { subscribeProfile, setController } from "../lib/team.js"

export default function Settings({ go }) {
  const { user, logout } = useAuth()
  const admin = isSuperadmin(user)
  const [profile, setProfile] = useState(null)
  const [pstat, setPstat] = useState("default")

  useEffect(() => {
    setPstat(pushStatus())
    let unsub
    try { unsub = subscribeProfile(setProfile) } catch (e) { console.error(e) }
    return () => unsub && unsub()
  }, [])

  const isController = !!profile?.isController

  async function toggleController() {
    try { await setController(!isController) } catch (e) { console.error(e) }
  }
  async function togglePush() {
    if (pstat === "granted") { alert("Para desativar, use as configurações de notificação do navegador/dispositivo."); return }
    try { await enablePush(); setPstat("granted") }
    catch (e) { alert(e.message || "Não foi possível ativar as notificações.") }
  }

  return (
    <div className="screen fn-sub-screen settings-screen">
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
        <div className="row-item">
          <span className="row-ic"><Bell size={18} /></span>
          <span className="row-label">Notificações push</span>
          <span className={`switch${pstat === "granted" ? " on" : ""}`} role="switch" aria-checked={pstat === "granted"}
            tabIndex={0} onClick={togglePush}><i /></span>
        </div>
        <button className="row-item danger" onClick={logout}>
          <span className="row-ic"><LogOut size={18} /></span>
          <span className="row-label">Sair da conta</span>
        </button>
      </div>

      <div className="settings-section">Equipe</div>
      <div className="list-card">
        <button className="row-item" onClick={() => go("team")}>
          <span className="row-ic"><Users size={18} /></span>
          <span className="row-label">Minha equipe<br /><span className="row-label sub">{isController || admin ? "Adicione e edite membros" : "Veja sua equipe"}</span></span>
        </button>
      </div>

      <div className="settings-section">Relatórios</div>
      <div className="list-card">
        <button className="row-item" onClick={() => go("reportmodel")}>
          <span className="row-ic"><FileText size={18} /></span>
          <span className="row-label">Modelo do relatório<br /><span className="row-label sub">Defina como formatar a análise do áudio</span></span>
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
          </div>
        </>
      )}

      <div className="settings-section">Aplicativo</div>
      <div className="list-card">
        <button className="row-item" onClick={() => { go("home"); window.dispatchEvent(new Event("controlai:tour")) }}>
          <span className="row-ic"><Bell size={18} /></span>
          <span className="row-label">Rever tour de boas-vindas</span>
        </button>
        <div className="row-item static">
          <span className="row-label">Versão</span>
          <span className="row-value">0.0.1</span>
        </div>
      </div>
    </div>
  )
}
