import { useState, useMemo, useEffect } from "react"
import { Back, Menu, Plus, ChevronLeft, ChevronRight, Check, X } from "../icons.jsx"
import SideMenu from "../components/SideMenu.jsx"
import { useAuth } from "../auth.jsx"
import { eventCategories, calRef } from "../data.js"
import { subscribeEvents, createEvent, deleteEvent } from "../lib/events.js"

const WEEKDAYS = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"]
const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
const MONTHS_FULL = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]
const TODAY = 19

// tipos de evento (inclui "tarefa", além das 3 categorias dos widgets)
const typeInfo = {
  ...eventCategories,
  tarefa: { label: "Tarefas", plural: "Tarefas", sub: "A fazer", color: "#c9a4ea" },
}
const ADD_TYPES = ["tarefa", "reuniao", "vencimento", "feriado"]

export default function Calendar({ go }) {
  const { user, logout } = useAuth()
  const nome = user?.displayName || user?.email?.split("@")[0] || "usuário"
  const [menu, setMenu] = useState(false)
  const [modal, setModal] = useState(null)        // visualização
  const [add, setAdd] = useState(null)            // formulário de adicionar
  const [view, setView] = useState({ year: calRef.year, month: calRef.month })
  const [evts, setEvts] = useState([])

  useEffect(() => {
    let unsub
    try { unsub = subscribeEvents((list) => setEvts(list)) } catch (e) { console.error(e) }
    return () => unsub && unsub()
  }, [])

  const isCurrentMonth = view.year === calRef.year && view.month === calRef.month

  const monthEvents = useMemo(
    () => evts.filter((e) => e.year === view.year && e.month === view.month),
    [evts, view]
  )
  const byDay = useMemo(() => {
    const m = {}
    for (const e of monthEvents) (m[e.day] ||= []).push(e)
    return m
  }, [monthEvents])
  const counts = useMemo(() => {
    const c = {}
    for (const e of monthEvents) c[e.type] = (c[e.type] || 0) + 1
    return c
  }, [monthEvents])

  const cells = useMemo(() => {
    const first = new Date(view.year, view.month, 1)
    const daysInMonth = new Date(view.year, view.month + 1, 0).getDate()
    const lead = (first.getDay() + 6) % 7
    const arr = Array.from({ length: lead }, () => null)
    for (let d = 1; d <= daysInMonth; d++) arr.push(d)
    while (arr.length % 7 !== 0) arr.push(null)
    return arr
  }, [view])

  function shiftMonth(d) {
    setView((v) => {
      let m = v.month + d, y = v.year
      if (m < 0) { m = 11; y-- }
      if (m > 11) { m = 0; y++ }
      return { year: y, month: m }
    })
  }

  const openDay = (day) => {
    const items = byDay[day] || []
    setModal({
      day,
      title: `${day} de ${MONTHS_FULL[view.month]}`,
      sub: items.length ? `${items.length} evento${items.length > 1 ? "s" : ""}` : "Nenhum evento neste dia",
      items,
    })
  }
  const openAll = () => setModal({
    title: `Eventos de ${MONTHS_FULL[view.month]}`,
    sub: `${monthEvents.length} eventos`,
    items: monthEvents.slice().sort((a, b) => a.day - b.day),
  })

  function openAdd(day, type) {
    setModal(null)
    setAdd({ day: day || (isCurrentMonth ? TODAY : 1), type: type || "tarefa", title: "", time: "" })
  }
  async function saveAdd() {
    if (!add.title.trim()) return
    try {
      await createEvent({
        title: add.title.trim(),
        type: add.type,
        day: Number(add.day) || 1,
        month: view.month,
        year: view.year,
        time: add.time.trim() || "—",
      })
    } catch (e) { console.error(e); alert("Não foi possível salvar a tarefa.") }
    setAdd(null)
  }

  async function removeEvent(ev) {
    if (!confirm(`Excluir "${ev.title}"?`)) return
    try { await deleteEvent(ev) } catch (e) { console.error(e) }
    setModal(null)
  }

  return (
    <div className="screen has-nav">
      <SideMenu open={menu} onClose={() => setMenu(false)} nome={nome} go={go} logout={logout} active="calendar" />

      <div className="topbar">
        <button className="round-btn" onClick={() => go("home")} aria-label="Voltar"><Back size={20} /></button>
        <div className="cal-head"><div className="cal-title">Calendário</div></div>
        <button className="round-btn" onClick={() => setMenu(true)} aria-label="Menu"><Menu size={20} /></button>
      </div>

      {/* navegação de meses (minimalista) */}
      <div className="cal-nav">
        <button onClick={() => shiftMonth(-1)} aria-label="Mês anterior"><ChevronLeft size={20} /></button>
        <span className="cal-nav-label">{MONTHS_FULL[view.month]} {view.year}</span>
        <button onClick={() => shiftMonth(1)} aria-label="Próximo mês"><ChevronRight size={20} /></button>
      </div>

      {/* grade do calendário */}
      <div className="cal-card">
        <div className="cal-weekdays">{WEEKDAYS.map((w) => <span key={w}>{w}</span>)}</div>
        <div className="cal-grid">
          {cells.map((day, i) => {
            if (day == null) return <div key={`e${i}`} className="cal-day muted" />
            const dayEvents = byDay[day] || []
            const dots = [...new Set(dayEvents.map((e) => e.type))].slice(0, 3)
            const today = day === TODAY && isCurrentMonth
            return (
              <button key={day} className={`cal-day${today ? " today" : ""}`} onClick={() => openDay(day)}>
                <span>{day}</span>
                <span className="cal-dots">
                  {dots.map((t) => <i key={t} style={{ background: today ? "#fff" : typeInfo[t].color }} />)}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* resumo do mês */}
      <button className="summary-card" onClick={openAll} style={{ width: "100%" }}>
        <div className="sc-label">Eventos de {MONTHS_FULL[view.month]}</div>
        <div className="sc-big">{monthEvents.length} Eventos</div>
        <div className="sc-sub">Clique para ver todos</div>
      </button>

      {/* mini cards por categoria — clicar adiciona uma tarefa dessa categoria */}
      <div className="mini-grid">
        {Object.entries(eventCategories).map(([type, c]) => (
          <button key={type} className="mini-card" onClick={() => openAdd(null, type)}>
            <div className="mc-head"><span className="mc-dot" style={{ background: c.color }} />{c.label}</div>
            <div className="mc-big">{counts[type] || 0}</div>
            <div className="mc-sub">{c.sub}</div>
          </button>
        ))}
      </div>

      {/* modal de visualização */}
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
                  <span className="ev-dot" style={{ background: typeInfo[ev.type].color }} />
                  <span className="ev-info">
                    <span className="ev-title" style={{ display: "block" }}>{ev.title}</span>
                    <span className="ev-meta" style={{ display: "block" }}>
                      {MONTHS[view.month]} {ev.day} · {ev.time} · {typeInfo[ev.type].label}
                    </span>
                  </span>
                  <button className="ev-del" onClick={() => removeEvent(ev)} aria-label="Excluir"><X size={16} /></button>
                </div>
              ))
            )}
            <button className="pill block" style={{ marginTop: 16 }} onClick={() => openAdd(modal.day)}>
              <Plus size={18} /> Adicionar tarefa{modal.day ? ` no dia ${modal.day}` : ""}
            </button>
          </div>
        </div>
      )}

      {/* modal de adicionar */}
      {add && (
        <div className="modal-overlay" onClick={() => setAdd(null)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-grip" />
            <div className="modal-title">Nova tarefa</div>
            <div className="modal-sub">{MONTHS_FULL[view.month]} {view.year}</div>

            <div className="type-chips">
              {ADD_TYPES.map((t) => (
                <button
                  key={t}
                  className={`type-chip${add.type === t ? " active" : ""}`}
                  onClick={() => setAdd((a) => ({ ...a, type: t }))}
                >
                  <span className="mc-dot" style={{ background: typeInfo[t].color }} />
                  {typeInfo[t].label}
                </button>
              ))}
            </div>

            <label className="field" style={{ marginTop: 14 }}>
              <span>Título</span>
              <input className="rec-title-input" value={add.title} autoFocus
                onChange={(e) => setAdd((a) => ({ ...a, title: e.target.value }))}
                placeholder="Ex.: Reunião com cliente" />
            </label>

            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <label className="field" style={{ flex: "0 0 90px" }}>
                <span>Dia</span>
                <input className="rec-title-input" type="number" min="1" max="31" value={add.day}
                  onChange={(e) => setAdd((a) => ({ ...a, day: e.target.value }))} />
              </label>
              <label className="field" style={{ flex: 1 }}>
                <span>Horário</span>
                <input className="rec-title-input" value={add.time}
                  onChange={(e) => setAdd((a) => ({ ...a, time: e.target.value }))}
                  placeholder="Ex.: 14:00" />
              </label>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button className="pill ghost" style={{ flex: 1, borderRadius: 16 }} onClick={() => setAdd(null)}><X size={18} /> Cancelar</button>
              <button className="pill" style={{ flex: 1, borderRadius: 16 }} onClick={saveAdd}><Check size={18} /> Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
