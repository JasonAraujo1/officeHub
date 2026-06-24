import { useEffect, useMemo, useState } from "react"
import { Back, Chart, FileText, Calendar, Check } from "../icons.jsx"
import { FN_COLORS, textOn } from "../lib/colors.js"
import { subscribeTasks } from "../lib/tasks.js"
import { subscribeReports } from "../lib/reports.js"
import { subscribeEvents } from "../lib/events.js"

function toDate(v) {
  if (!v) return null
  if (typeof v.toDate === "function") return v.toDate()
  if (typeof v.seconds === "number") return new Date(v.seconds * 1000)
  const d = new Date(v)
  return isNaN(d) ? null : d
}

const PERIODS = [
  { key: "week", label: "Semana" },
  { key: "month", label: "Mês" },
  { key: "year", label: "Ano" },
]

const WD = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
const MES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

function inPeriod(d, period) {
  if (!d) return false
  const now = new Date()
  if (period === "week") {
    const start = new Date(now); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - 6)
    return d >= start
  }
  if (period === "month") return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  return d.getFullYear() === now.getFullYear()
}

// Gera os "baldes" (buckets) do gráfico conforme o período.
function buildBuckets(period) {
  const now = new Date()
  if (period === "week") {
    const arr = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i)
      arr.push({ label: WD[d.getDay()], match: (x) => x.toDateString() === d.toDateString() })
    }
    return arr
  }
  if (period === "month") {
    return [0, 1, 2, 3, 4].map((w) => ({
      label: `S${w + 1}`,
      match: (x) => x.getFullYear() === now.getFullYear() && x.getMonth() === now.getMonth() && Math.floor((x.getDate() - 1) / 7) === w,
    }))
  }
  return MES.map((m, i) => ({
    label: m,
    match: (x) => x.getFullYear() === now.getFullYear() && x.getMonth() === i,
  }))
}

export default function Dashboard({ go }) {
  const [tasks, setTasks] = useState([])
  const [reports, setReports] = useState([])
  const [events, setEvents] = useState([])
  const [period, setPeriod] = useState("week")

  useEffect(() => {
    const subs = []
    try { subs.push(subscribeTasks(setTasks)) } catch (e) { console.error(e) }
    try { subs.push(subscribeReports(setReports)) } catch (e) { console.error(e) }
    try { subs.push(subscribeEvents(setEvents)) } catch (e) { console.error(e) }
    return () => subs.forEach((u) => u && u())
  }, [])

  const data = useMemo(() => {
    const t = tasks.filter((x) => inPeriod(toDate(x.createdAt), period))
    const r = reports.filter((x) => inPeriod(toDate(x.createdAt), period))
    const e = events.filter((x) => inPeriod(toDate(x.createdAt), period))
    const status = {
      todo: t.filter((x) => (x.status || "todo") === "todo").length,
      doing: t.filter((x) => x.status === "doing").length,
      done: t.filter((x) => x.status === "done").length,
    }
    // gráfico: atividades (tarefas + relatórios + eventos) por balde
    const buckets = buildBuckets(period)
    const all = [...t, ...r, ...e].map((x) => toDate(x.createdAt)).filter(Boolean)
    const series = buckets.map((b) => ({ label: b.label, n: all.filter((d) => b.match(d)).length }))
    return { t, r, e, status, series }
  }, [tasks, reports, events, period])

  const totalAtiv = data.t.length
  const pctDone = totalAtiv ? Math.round((data.status.done / totalAtiv) * 100) : 0
  const maxBar = Math.max(1, ...data.series.map((s) => s.n))

  const cards = [
    { label: "Atividades", n: data.t.length, color: "tools", Icon: Chart },
    { label: "Concluídas", n: data.status.done, color: "home", Icon: Check },
    { label: "Relatórios", n: data.r.length, color: "reports", Icon: FileText },
    { label: "Eventos", n: data.e.length, color: "calendar", Icon: Calendar },
  ]

  const st = [
    { key: "todo", label: "A fazer", n: data.status.todo, c: FN_COLORS.calendar.dark },
    { key: "doing", label: "Fazendo", n: data.status.doing, c: FN_COLORS.tools.dark },
    { key: "done", label: "Feito", n: data.status.done, c: FN_COLORS.home.dark },
  ]
  const stTotal = Math.max(1, data.status.todo + data.status.doing + data.status.done)

  return (
    <div className="screen fn-sub-screen dash-screen">
      <div className="topbar">
        <button className="round-btn" onClick={() => go("widgets")} aria-label="Voltar"><Back size={20} /></button>
        <div className="title center">Dashboard</div>
        <span style={{ width: 44 }} />
      </div>

      {/* período */}
      <div className="rpt-tabs">
        {PERIODS.map((p) => (
          <button key={p.key} className={period === p.key ? "active" : ""} onClick={() => setPeriod(p.key)}>{p.label}</button>
        ))}
      </div>

      <p className="dash-summary">
        <strong>{totalAtiv}</strong> {totalAtiv === 1 ? "atividade" : "atividades"} neste período · <strong>{data.status.done}</strong> {data.status.done === 1 ? "concluída" : "concluídas"} ({pctDone}%)
      </p>

      {/* números (blocos foscos, sem estilo de widget) */}
      <div className="dash-stats">
        {cards.map(({ label, n, color, Icon }) => {
          const c = FN_COLORS[color]
          return (
            <div key={label} className="dash-tile">
              <span className="dash-tile-ic" style={{ background: c.dark }}><Icon size={15} /></span>
              <span className="dash-tile-n">{n}</span>
              <span className="dash-tile-l">{label}</span>
            </div>
          )
        })}
      </div>

      {/* status das tarefas */}
      <div className="settings-section">Status das tarefas</div>
      <div className="dash-card">
        <div className="dash-stack">
          {st.map((s) => s.n > 0 && (
            <span key={s.key} style={{ width: `${(s.n / stTotal) * 100}%`, background: s.c }} />
          ))}
        </div>
        <div className="dash-legend">
          {st.map((s) => (
            <div key={s.key} className="dash-leg">
              <i style={{ background: s.c }} /><span>{s.label}</span><strong>{s.n}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* atividades por período */}
      <div className="settings-section">Atividades por período</div>
      <div className="dash-card">
        <div className="dash-bars">
          {data.series.map((s, i) => (
            <div key={i} className="dash-bar">
              <span className="dash-bar-n">{s.n || ""}</span>
              <span className="dash-bar-fill" style={{ height: `${(s.n / maxBar) * 100}%`, background: FN_COLORS.reports.dark }} />
              <span className="dash-bar-l">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
