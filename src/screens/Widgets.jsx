import { useEffect, useState } from "react"
import { Mic, Plus, FileText, Calendar, Menu, User, Gear, Shield, Help, Doc, Users, Chart } from "../icons.jsx"
import SideMenu from "../components/SideMenu.jsx"
import { useAuth } from "../auth.jsx"
import { isSuperadmin, roleLabel } from "../lib/roles.js"
import { FN_COLORS, textOn } from "../lib/colors.js"
import { subscribeReports } from "../lib/reports.js"
import { subscribeEvents } from "../lib/events.js"
import { subscribeNotes } from "../lib/notes.js"
import { subscribeConnections } from "../lib/team.js"
import iaImg from "../assets/AI.png"

export default function Widgets({ go }) {
  const { user, logout } = useAuth()
  const nome = user?.displayName || user?.email?.split("@")[0] || "usuário"
  const inicial = nome.charAt(0).toUpperCase()
  const admin = isSuperadmin(user)
  const [menu, setMenu] = useState(false)
  const [counts, setCounts] = useState({ rep: null, cal: null, notes: null, team: null })

  useEffect(() => {
    const subs = []
    const set = (k) => (list) => setCounts((c) => ({ ...c, [k]: list.length }))
    try { subs.push(subscribeReports(set("rep"))) } catch (e) {}
    try { subs.push(subscribeEvents(set("cal"))) } catch (e) {}
    try { subs.push(subscribeNotes(set("notes"))) } catch (e) {}
    try { subs.push(subscribeConnections(set("team"))) } catch (e) {}
    return () => subs.forEach((u) => u && u())
  }, [])

  const shortcuts = [
    { key: "rec", label: "Gravação", sub: "Gravar e transcrever", color: "home", Icon: Mic, onClick: () => go("record") },
    { key: "att", label: "Anexar", sub: "Enviar um arquivo", color: "record", Icon: Plus, onClick: () => go("attach") },
    { key: "rep", label: "Relatórios", unit: "Relatórios", color: "reports", Icon: FileText, onClick: () => go("reports") },
    { key: "cal", label: "Calendário", unit: "Eventos", color: "calendar", Icon: Calendar, onClick: () => go("calendar") },
    { key: "notes", label: "Notas", unit: "Notas", color: "tools", Icon: Doc, onClick: () => go("notes") },
    { key: "team", label: "Minha equipe", unit: "Conexões", color: "account", Icon: Users, onClick: () => go("team") },
    { key: "ia", label: "IA Controlaí", sub: "Gestão ágil", color: "home", img: iaImg, Icon: Chart, onClick: () => go("ai") },
    { key: "dash", label: "Dashboard", sub: "Semana, mês e ano", color: "tools", Icon: Chart, onClick: () => go("dashboard") },
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
      <button className="config-widget" data-tour="fn-config" onClick={() => go("settings")}>
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
      <div className="stat-grid" data-tour="fn-shortcuts">
        {shortcuts.map(({ key, label, sub, unit, color, Icon, img, onClick }) => {
          const c = FN_COLORS[color]
          const txt = textOn(c.light)
          const n = counts[key]
          return (
            <button key={key} className="stat-card sc-widget" onClick={onClick}
              style={{ background: `color-mix(in srgb, ${c.light} 52%, transparent)`, color: txt, position: "relative", overflow: "hidden" }}>
              {/* doodle: ícone/imagem grande e esmaecido ao fundo */}
              {img
                ? <img src={img} alt="" style={{ position: "absolute", width: 96, right: -14, bottom: -14, opacity: 0.18, pointerEvents: "none" }} />
                : <Icon size={118} style={{ position: "absolute", right: -16, bottom: -18, color: c.dark, opacity: 0.16, pointerEvents: "none" }} />}
              <div className="stat-head" style={{ color: txt }}><span className="stat-ic" style={{ color: txt }}>{img ? <img src={img} alt="" style={{ width: 18, height: 18, objectFit: "contain" }} /> : <Icon size={16} />}</span>{label}</div>
              <div className="stat-val" style={{ position: "relative" }}>
                {unit ? (
                  <>
                    <span className="stat-big" style={{ color: txt }}>{n == null ? "—" : n}</span>
                    <span className="stat-sub" style={{ color: txt, opacity: 0.75 }}>{unit}</span>
                  </>
                ) : (
                  <span className="stat-sub" style={{ color: txt, opacity: 0.85 }}>{sub}</span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
