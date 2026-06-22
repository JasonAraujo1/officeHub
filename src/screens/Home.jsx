import { useEffect, useState } from "react"
import { Plus, FileText, Calendar, Menu, Mic, Paperclip, Clock, Bell, Check, Sparkle, FileSolid, CalendarSolid, MicSolid } from "../icons.jsx"
import SideMenu from "../components/SideMenu.jsx"
import NotifBell from "../components/Bell.jsx"
import { useAuth } from "../auth.jsx"
import { subscribeReports } from "../lib/reports.js"
import { events } from "../data.js"

const TODAY_LABEL = "Jun 19, 2026"

function MiniBars({ seed = 1, color = "rgba(0,0,0,.6)" }) {
  const base = seed === 1
    ? [38, 64, 48, 82, 56, 72, 44, 90, 60, 76]
    : [70, 46, 84, 52, 66, 40, 78, 58, 88, 50]
  return (
    <svg className="mini-bars" viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden="true">
      {base.map((h, i) => {
        const ph = (h / 100) * 32
        return <rect key={i} x={i * 10 + 1.5} y={32 - ph} width="6.5" height={ph} rx="2" fill={color} />
      })}
    </svg>
  )
}

export default function Home({ go }) {
  const { user, logout } = useAuth()
  const nome = user?.displayName || user?.email?.split("@")[0] || "usuário"
  const inicial = nome.charAt(0).toUpperCase()
  const [menu, setMenu] = useState(false)
  const [reportCount, setReportCount] = useState(null)

  useEffect(() => {
    let unsub
    try { unsub = subscribeReports((list) => setReportCount(list.length)) } catch (e) {}
    return () => unsub && unsub()
  }, [])

  return (
    <div className="screen home has-nav">
      <SideMenu open={menu} onClose={() => setMenu(false)} nome={nome} go={go} logout={logout} active="home" />

      {/* header branco (~40% da tela) */}
      <div className="home-header">
        <div className="home-top">
          <div className="user-head">
            <div className="avatar">{inicial}</div>
            <div>
              <div className="who-sub">Bem-vindo!</div>
              <div className="who-name">{nome}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <NotifBell go={go} />
            <button className="round-btn" onClick={() => setMenu(true)} aria-label="Menu"><Menu size={20} /></button>
          </div>
        </div>
        <div className="home-head-text">
          <div className="date-label">{TODAY_LABEL}</div>
          <h1 className="headline home-headline">Olá, {nome}! O que deseja fazer hoje?</h1>
        </div>

        {/* carrossel de tags (rodapé do header) */}
        <div className="chip-row home-tags">
          <button className="tag" onClick={() => go("calendar")}><span className="tag-ic" style={{ background: "var(--yellow)" }}><Calendar size={15} /></span>Reuniões</button>
          <button className="tag" onClick={() => go("calendar")}><span className="tag-ic" style={{ background: "var(--blue)" }}><Clock size={15} /></span>Prazos</button>
          <button className="tag" onClick={() => go("calendar")}><span className="tag-ic" style={{ background: "var(--green)" }}><FileText size={15} /></span>Vencimentos</button>
          <button className="tag" onClick={() => go("calendar")}><span className="tag-ic" style={{ background: "var(--pink)" }}><Sparkle size={15} /></span>Feriados</button>
          <button className="tag" onClick={() => go("calendar")}><span className="tag-ic" style={{ background: "var(--orange)" }}><Bell size={15} /></span>Lembretes</button>
          <button className="tag" onClick={() => go("calendar")}><span className="tag-ic" style={{ background: "var(--lilac)" }}><Check size={15} /></span>Tarefas</button>
          <button className="tag tag-add" onClick={() => go("calendar")} aria-label="Adicionar"><Plus size={18} /></button>
        </div>
      </div>

      {/* corpo preto com os widgets */}
      <div className="home-body">

        {/* stat cards */}
        <div className="stat-grid">
          <button className="stat-card coral" onClick={() => go("reports")}>
            <div className="stat-head"><span className="stat-ic"><FileSolid size={16} /></span>Relatórios</div>
            <MiniBars seed={1} color="#e3824a" />
            <div className="stat-val">
              <span className="stat-big">{reportCount == null ? "—" : reportCount}</span>
              <span className="stat-sub">{reportCount === 1 ? "Relatório" : "Relatórios"}</span>
            </div>
          </button>
          <button className="stat-card lilac" onClick={() => go("calendar")}>
            <div className="stat-head"><span className="stat-ic"><CalendarSolid size={16} /></span>Calendário</div>
            <MiniBars seed={2} color="#af7dd0" />
            <div className="stat-val">
              <span className="stat-big">{events.length}</span>
              <span className="stat-sub">{events.length === 1 ? "Evento" : "Eventos"}</span>
            </div>
          </button>
        </div>

        {/* card verde: gravar / anexar */}
        <div className="hero-card">
          <div className="hero-label"><MicSolid size={14} /> Gravação</div>
          <div className="hero-title">Iniciar gravação / Transcrição</div>
          <div className="hero-actions">
            <button className="pill" onClick={() => go("record")}><Mic size={18} /> Iniciar</button>
            <button className="pill" onClick={() => go("attach")}><Paperclip size={18} /> Anexar</button>
          </div>
        </div>

      </div>
    </div>
  )
}
