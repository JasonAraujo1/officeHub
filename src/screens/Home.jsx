import { useEffect, useRef, useState } from "react"
import { Plus, FileText, Calendar, Menu, Mic, Paperclip, Clock, Bell, Check, Sparkle, FileSolid, CalendarSolid, MicSolid, Doc, Users, Chart, Pencil, X, Activity } from "../icons.jsx"
import SideMenu from "../components/SideMenu.jsx"
import NotifBell from "../components/Bell.jsx"
import { useAuth } from "../auth.jsx"
import { FN_COLORS, textOn } from "../lib/colors.js"
import { subscribeReports } from "../lib/reports.js"
import { subscribeEvents } from "../lib/events.js"
import { subscribeNotes } from "../lib/notes.js"
import { subscribeTasks } from "../lib/tasks.js"
import { subscribeConnections, subscribeProfile, setHome } from "../lib/team.js"

const _MES_ABBR = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
const _hoje = new Date()
const TODAY_LABEL = `${_MES_ABBR[_hoje.getMonth()]} ${_hoje.getDate()}, ${_hoje.getFullYear()}`

// catálogo de widgets pequenos disponíveis para a Home
const CATALOG = {
  reports: { label: "Relatórios", color: "reports", Icon: FileSolid, count: "reports", screen: "reports" },
  calendar: { label: "Calendário", color: "calendar", Icon: CalendarSolid, count: "events", screen: "calendar" },
  notes: { label: "Notas", color: "record", Icon: Doc, count: "notes", screen: "notes" },
  dashboard: { label: "Dashboard", color: "tools", Icon: Chart, count: null, screen: "dashboard" },
  ai: { label: "IA Controlaí", color: "home", Icon: Sparkle, count: null, screen: "ai" },
  team: { label: "Equipe", color: "account", Icon: Users, count: "team", screen: "team" },
  activities: { label: "Atividades", color: "account", Icon: Activity, count: "tasks", screen: "calendar", payload: { tab: "act" } },
  record: { label: "Gravar", color: "home", Icon: MicSolid, count: null, screen: "record" },
  attach: { label: "Anexar", color: "record", Icon: Paperclip, count: null, screen: "attach" },
}
const DEFAULT_HOME = { layout: "big", slots: ["reports", "calendar"] }

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
  const [counts, setCounts] = useState({ reports: null, events: null, notes: null, team: null, tasks: null })

  const [cfg, setCfg] = useState(DEFAULT_HOME)
  const [editing, setEditing] = useState(false)
  const [picker, setPicker] = useState(null)   // índice do slot sendo trocado
  const seeded = useRef(false)

  useEffect(() => {
    const subs = []
    const set = (k) => (list) => setCounts((c) => ({ ...c, [k]: list.length }))
    try { subs.push(subscribeReports(set("reports"))) } catch (e) {}
    try { subs.push(subscribeEvents(set("events"))) } catch (e) {}
    try { subs.push(subscribeNotes(set("notes"))) } catch (e) {}
    try { subs.push(subscribeTasks(set("tasks"))) } catch (e) {}
    try { subs.push(subscribeConnections(set("team"))) } catch (e) {}
    try {
      subs.push(subscribeProfile((p) => {
        if (!seeded.current) {
          seeded.current = true
          if (p?.home?.slots?.length) setCfg({ layout: p.home.layout === "small4" ? "small4" : "big", slots: p.home.slots })
        }
      }))
    } catch (e) {}
    return () => subs.forEach((u) => u && u())
  }, [])

  function save(next) { setCfg(next); setHome(next).catch(() => {}) }

  function setLayout(layout) {
    if (layout === cfg.layout) return
    let slots
    if (layout === "small4") {
      const fill = Object.keys(CATALOG).filter((k) => !cfg.slots.includes(k))
      slots = [...cfg.slots.slice(0, 2), fill[0] || "notes", fill[1] || "dashboard"]
    } else {
      slots = cfg.slots.slice(0, 2)
    }
    save({ layout, slots })
  }

  function pick(key) {
    if (picker == null) return
    const slots = cfg.slots.slice()
    // se já existe em outro slot, troca os dois (evita duplicado)
    const exists = slots.indexOf(key)
    if (exists >= 0 && exists !== picker) slots[exists] = slots[picker]
    slots[picker] = key
    save({ ...cfg, slots })
    setPicker(null)
  }

  const renderSmall = (key, i) => {
    const cat = CATALOG[key] || CATALOG.reports
    const c = FN_COLORS[cat.color]; const txt = textOn(c.light)
    const n = cat.count ? counts[cat.count] : null
    const Icon = cat.Icon
    return (
      <button key={i} className={`stat-card sc-widget${editing ? " jiggle" : ""}`}
        onClick={() => editing ? setPicker(i) : go(cat.screen, cat.payload)}
        style={{ background: c.light, color: txt, position: "relative", overflow: "hidden" }}>
        {editing && <span className="edit-badge"><Pencil size={12} /></span>}
        <div className="stat-head" style={{ color: txt }}><span className="stat-ic" style={{ color: txt }}><Icon size={16} /></span>{cat.label}</div>
        <MiniBars seed={i % 2 ? 2 : 1} color={c.dark} />
        <div className="stat-val">
          {cat.count
            ? <><span className="stat-big" style={{ color: txt }}>{n == null ? "—" : n}</span><span className="stat-sub" style={{ color: txt, opacity: .75 }}>{cat.label}</span></>
            : <span className="stat-sub" style={{ color: txt, opacity: .85 }}>Abrir</span>}
        </div>
      </button>
    )
  }

  const placed = new Set(cfg.slots)

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
            <button className={`round-btn${editing ? " on" : ""}`} onClick={() => { setEditing((v) => !v); setPicker(null) }} aria-label="Editar Home">
              {editing ? <Check size={18} /> : <Pencil size={18} />}
            </button>
            <span data-tour="home-bell" style={{ display: "inline-flex" }}><NotifBell go={go} /></span>
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
        {editing && (
          <div className="home-edit-bar">
            <span className="home-edit-label">Editando a Home</span>
            <div className="home-layout-toggle">
              <button className={cfg.layout === "big" ? "active" : ""} onClick={() => setLayout("big")}>2 + grande</button>
              <button className={cfg.layout === "small4" ? "active" : ""} onClick={() => setLayout("small4")}>4 pequenos</button>
            </div>
          </div>
        )}

        <div className="stat-grid">
          {renderSmall(cfg.slots[0], 0)}
          {renderSmall(cfg.slots[1], 1)}
        </div>

        {cfg.layout === "big" ? (
          <div className={`hero-card${editing ? " jiggle" : ""}`} data-tour="home-hero">
            <div className="hero-label"><MicSolid size={14} /> Gravação</div>
            <div className="hero-title">Iniciar gravação / Transcrição</div>
            <div className="hero-actions" style={editing ? { pointerEvents: "none", opacity: .85 } : undefined}>
              <button className="pill" onClick={() => go("record")}><Mic size={18} /> Iniciar</button>
              <button className="pill" onClick={() => go("attach")}><Paperclip size={18} /> Anexar</button>
            </div>
          </div>
        ) : (
          <div className="stat-grid">
            {renderSmall(cfg.slots[2], 2)}
            {renderSmall(cfg.slots[3], 3)}
          </div>
        )}
      </div>

      {/* seletor de widget */}
      {picker != null && (
        <div className="home-picker-overlay" onClick={() => setPicker(null)}>
          <div className="home-picker" onClick={(e) => e.stopPropagation()}>
            <div className="home-picker-head">
              <span>Escolher widget</span>
              <button className="round-btn subtle" onClick={() => setPicker(null)} aria-label="Fechar"><X size={18} /></button>
            </div>
            <div className="home-picker-grid">
              {Object.entries(CATALOG).map(([key, cat]) => {
                const c = FN_COLORS[cat.color]; const Icon = cat.Icon
                const isPlaced = placed.has(key) && cfg.slots[picker] !== key
                return (
                  <button key={key} className="home-picker-item" onClick={() => pick(key)} disabled={isPlaced}
                    style={{ opacity: isPlaced ? .4 : 1 }}>
                    <span className="home-picker-ic" style={{ background: c.light, color: textOn(c.light) }}><Icon size={18} /></span>
                    {cat.label}{isPlaced ? " ✓" : ""}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
