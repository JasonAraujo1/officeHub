import { useState, useMemo } from "react"
import { Back, Menu } from "../icons.jsx"
import SideMenu from "../components/SideMenu.jsx"
import { useAuth } from "../auth.jsx"
import { events, eventCategories, calRef } from "../data.js"

const WEEKDAYS = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"]
const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
const TODAY = 19 // dia de referência da interface (jun/2026)

function cssVar(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim() }

export default function Calendar({ go }) {
  const { user, logout } = useAuth()
  const nome = user?.displayName || user?.email?.split("@")[0] || "usuário"
  const [menu, setMenu] = useState(false)
  const [modal, setModal] = useState(null) // { title, sub, items }

  // eventos por dia
  const byDay = useMemo(() => {
    const m = {}
    for (const e of events) (m[e.day] ||= []).push(e)
    return m
  }, [])

  // contagem por categoria
  const counts = useMemo(() => {
    const c = {}
    for (const e of events) c[e.type] = (c[e.type] || 0) + 1
    return c
  }, [])

  // grade do mês (segunda-feira primeiro)
  const cells = useMemo(() => {
    const first = new Date(calRef.year, calRef.month, 1)
    const daysInMonth = new Date(calRef.year, calRef.month + 1, 0).getDate()
    const jsDow = first.getDay()            // 0=dom ... 6=sab
    const lead = (jsDow + 6) % 7            // quantos vazios antes (seg=0)
    const arr = Array.from({ length: lead }, () => null)
    for (let d = 1; d <= daysInMonth; d++) arr.push(d)
    while (arr.length % 7 !== 0) arr.push(null)
    return arr
  }, [])

  const openDay = (day) => {
    const items = byDay[day] || []
    setModal({
      title: `${day} de ${MONTHS[calRef.month]}`,
      sub: items.length ? `${items.length} evento${items.length > 1 ? "s" : ""}` : "Nenhum evento neste dia",
      items,
    })
  }
  const openAll = () => setModal({ title: "Eventos do mês", sub: `${events.length} eventos agendados`, items: events.slice().sort((a, b) => a.day - b.day) })
  const openCat = (type) => {
    const items = events.filter((e) => e.type === type).sort((a, b) => a.day - b.day)
    setModal({ title: eventCategories[type].plural, sub: `${items.length} no mês`, items })
  }

  return (
    <div className="screen has-nav">
      <SideMenu open={menu} onClose={() => setMenu(false)} nome={nome} go={go} logout={logout} active="calendar" />

      <div className="topbar">
        <button className="round-btn" onClick={() => go("home")} aria-label="Voltar"><Back size={20} /></button>
        <div className="cal-head">
          <div className="cal-title">Calendário</div>
          <div className="cal-month">{MONTHS[calRef.month]} {TODAY}, {calRef.year}</div>
        </div>
        <button className="round-btn" onClick={() => setMenu(true)} aria-label="Menu"><Menu size={20} /></button>
      </div>

      {/* grade do calendário */}
      <div className="cal-card">
        <div className="cal-weekdays">{WEEKDAYS.map((w) => <span key={w}>{w}</span>)}</div>
        <div className="cal-grid">
          {cells.map((day, i) => {
            if (day == null) return <div key={`e${i}`} className="cal-day muted" />
            const dayEvents = byDay[day] || []
            const dots = [...new Set(dayEvents.map((e) => e.type))].slice(0, 3)
            const isToday = day === TODAY
            return (
              <button key={day} className={`cal-day${isToday ? " today" : ""}`} onClick={() => openDay(day)}>
                <span>{day}</span>
                <span className="cal-dots">
                  {dots.map((t) => (
                    <i key={t} style={{ background: isToday ? "#fff" : eventCategories[t].color }} />
                  ))}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* resumo da semana/mês */}
      <button className="summary-card" onClick={openAll} style={{ width: "100%" }}>
        <div className="sc-label">Eventos da semana</div>
        <div className="sc-big">{events.length} Eventos</div>
        <div className="sc-sub">Agendadas. Clique para ver mais</div>
      </button>

      {/* mini cards por categoria */}
      <div className="mini-grid">
        {Object.entries(eventCategories).map(([type, c]) => (
          <button key={type} className="mini-card" onClick={() => openCat(type)}>
            <div className="mc-head">
              <span className="mc-dot" style={{ background: c.color }} />
              {c.label}
            </div>
            <div className="mc-big">{counts[type] || 0}</div>
            <div className="mc-sub">{c.sub}</div>
          </button>
        ))}
      </div>

      {/* modal de eventos */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-grip" />
            <div className="modal-title">{modal.title}</div>
            <div className="modal-sub">{modal.sub}</div>
            {modal.items.length === 0 ? (
              <p className="rec-status-msg" style={{ margin: "8px 0" }}>Sem eventos para mostrar.</p>
            ) : (
              modal.items.map((ev) => (
                <div className="event-row" key={ev.id}>
                  <span className="ev-dot" style={{ background: eventCategories[ev.type].color }} />
                  <span className="ev-info">
                    <span className="ev-title" style={{ display: "block" }}>{ev.title}</span>
                    <span className="ev-meta" style={{ display: "block" }}>
                      {MONTHS[calRef.month]} {ev.day} · {ev.time} · {eventCategories[ev.type].label}
                    </span>
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
