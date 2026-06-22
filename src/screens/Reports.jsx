import { useEffect, useMemo, useState } from "react"
import { Back, FileText, Chevron, Pencil } from "../icons.jsx"
import { subscribeReports, deleteReport, renameReport, subscribeSharedReports } from "../lib/reports.js"

// Converte o createdAt (Timestamp do Firestore, Date ou {seconds}) em Date
function toDate(v) {
  if (!v) return null
  if (typeof v.toDate === "function") return v.toDate()
  if (typeof v.seconds === "number") return new Date(v.seconds * 1000)
  const d = new Date(v)
  return isNaN(d) ? null : d
}

function fmtDateTime(d) {
  if (!d) return ""
  return d.toLocaleDateString("pt-BR") + " · " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}

const PERIODS = [
  { key: "all", label: "Tudo" },
  { key: "day", label: "Hoje" },
  { key: "week", label: "Semana" },
  { key: "month", label: "Mês" },
  { key: "year", label: "Ano" },
]

function withinPeriod(date, period) {
  if (period === "all") return true
  if (!date) return false
  const now = new Date()
  const diff = now - date
  const DAY = 86400000
  if (period === "day") return date.toDateString() === now.toDateString()
  if (period === "week") return diff <= 7 * DAY
  if (period === "month") return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
  if (period === "year") return date.getFullYear() === now.getFullYear()
  return true
}

export default function Reports({ go }) {
  const [reports, setReports] = useState([])
  const [shared, setShared] = useState([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("all")
  const [mainTab, setMainTab] = useState("mine")

  async function handleDelete(e, r) {
    e.stopPropagation()
    if (!confirm(`Excluir "${r.title}"? Esta ação não pode ser desfeita.`)) return
    try {
      await deleteReport(r)
    } catch (err) {
      console.error(err)
      alert("Não foi possível excluir. Tente novamente.")
    }
  }

  async function handleRename(e, r) {
    e.stopPropagation()
    const novo = prompt("Novo nome do relatório:", r.title)
    if (novo == null) return
    const t = novo.trim()
    if (!t || t === r.title) return
    try {
      await renameReport(r, t)
    } catch (err) {
      console.error(err)
      alert("Não foi possível renomear. Tente novamente.")
    }
  }

  useEffect(() => {
    let unsub
    try {
      unsub = subscribeReports((list) => { setReports(list); setLoading(false) })
    } catch (e) {
      setLoading(false)
      console.error(e)
    }
    return () => unsub && unsub()
  }, [])

  // Relatórios compartilhados comigo (fui marcado por outra pessoa)
  useEffect(() => {
    let unsub
    try {
      unsub = subscribeSharedReports(setShared)
    } catch (e) {
      console.error(e)
    }
    return () => unsub && unsub()
  }, [])

  // Filtra por período e agrupa por mês (mais recente primeiro)
  const groups = useMemo(() => {
    const filtered = reports.filter((r) => withinPeriod(toDate(r.createdAt), period))
    const map = new Map()
    for (const r of filtered) {
      const d = toDate(r.createdAt)
      const key = d ? `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}` : "sem-data"
      const label = d
        ? d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
        : "Sem data"
      if (!map.has(key)) map.set(key, { key, label, items: [] })
      map.get(key).items.push(r)
    }
    return [...map.values()].sort((a, b) => (a.key < b.key ? 1 : -1))
  }, [reports, period])

  const renderCard = (r) => (
    <button
      key={r.id}
      className="recent-card"
      onClick={() => r.status === "done" && go("report", r)}
    >
      <span className="recent-icon"><FileText size={32} /></span>
      <span className="recent-info">
        <span className="r-title" style={{ display: "block" }}>{r.title}</span>
        {toDate(r.createdAt) && (
          <span className="r-when" style={{ display: "block" }}>{fmtDateTime(toDate(r.createdAt))}</span>
        )}

        {r.status === "done" ? (
          <span className="r-meta" style={{ display: "block" }}>
            Pronto{r.durationSec ? ` · ${Math.round(r.durationSec / 60)} min` : ""}
          </span>
        ) : r.status === "error" ? (
          <span className="r-meta" style={{ display: "block", color: "#c0392b" }}>
            Erro ao processar
          </span>
        ) : (
          <>
            <span className="r-meta" style={{ display: "block" }}>
              {r.stage || "Processando…"}
            </span>
            <span className="proc-bar">
              <i style={{ width: `${r.progress || 5}%` }} />
            </span>
          </>
        )}
      </span>

      {r.status === "done" ? (
        <span className="chev"><Chevron size={18} /></span>
      ) : r.status === "error" ? null : (
        <span className="proc-pct">{r.progress || 0}%</span>
      )}

      <span
        className="edit-btn"
        role="button"
        tabIndex={0}
        title="Renomear"
        aria-label="Renomear relatório"
        onClick={(e) => handleRename(e, r)}
        style={{ marginLeft: 4, padding: 6, color: "#000", display: "inline-flex", cursor: "pointer", flex: "0 0 auto" }}
      >
        <Pencil size={17} />
      </span>

      <span
        className="del-btn"
        role="button"
        tabIndex={0}
        title="Excluir"
        aria-label="Excluir relatório"
        onClick={(e) => handleDelete(e, r)}
        style={{ marginLeft: 8, padding: 6, color: "#000", display: "inline-flex", cursor: "pointer", flex: "0 0 auto" }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        </svg>
      </span>
    </button>
  )

  // só-leitura: relatórios que outra pessoa compartilhou comigo (não meus)
  const renderSharedCard = (r) => (
    <button key={r.id} className="recent-card" onClick={() => r.status === "done" && go("report", r)}>
      <span className="recent-icon"><FileText size={32} /></span>
      <span className="recent-info">
        <span className="r-title" style={{ display: "block" }}>{r.title}</span>
        {toDate(r.createdAt) && (
          <span className="r-when" style={{ display: "block" }}>{fmtDateTime(toDate(r.createdAt))}</span>
        )}
        <span className="r-meta" style={{ display: "block" }}>
          {r.status === "done" ? "Compartilhado com você" : r.status === "error" ? "Erro ao processar" : (r.stage || "Processando…")}
        </span>
      </span>
      {r.status === "done" && <span className="chev"><Chevron size={18} /></span>}
    </button>
  )

  const sharedOnly = shared.filter((s) => !reports.some((r) => r.id === s.id))

  return (
    <div className="screen has-nav reports-screen">
      <div className="topbar">
        <button className="round-btn" onClick={() => go("home")} aria-label="Voltar"><Back size={20} /></button>
        <div className="title center">Relatórios</div>
        <span style={{ width: 44 }} />
      </div>

      {loading ? (
        <p className="rec-status-msg" style={{ margin: "20px auto" }}>Carregando…</p>
      ) : (reports.length === 0 && sharedOnly.length === 0) ? (
        <div className="empty">
          <span className="empty-ic"><FileText size={36} /></span>
          <p>Nenhum relatório ainda.</p>
          <span>Grave ou anexe um áudio para gerar um relatório.</span>
        </div>
      ) : (
        <>
          <div className="rpt-tabs">
            <button className={mainTab === "mine" ? "active" : ""} onClick={() => setMainTab("mine")}>Meus relatórios</button>
            <button className={mainTab === "tagged" ? "active" : ""} onClick={() => setMainTab("tagged")}>@ marcados</button>
          </div>

          {mainTab === "mine" ? (
            reports.length === 0 ? (
              <p className="rec-status-msg" style={{ margin: "20px auto" }}>Você ainda não tem relatórios.</p>
            ) : (
              <>
                <div className="rpt-filter">
                  {PERIODS.map((p) => (
                    <button key={p.key} className={period === p.key ? "active" : ""} onClick={() => setPeriod(p.key)}>
                      {p.label}
                    </button>
                  ))}
                </div>

                {groups.length === 0 ? (
                  <p className="rec-status-msg" style={{ margin: "20px auto" }}>Nenhum relatório neste período.</p>
                ) : (
                  groups.map((g) => (
                    <div key={g.key}>
                      <div className="rpt-group-h">{g.label}</div>
                      <div className="recent-list">{g.items.map(renderCard)}</div>
                    </div>
                  ))
                )}
              </>
            )
          ) : (
            sharedOnly.length === 0 ? (
              <p className="rec-status-msg" style={{ margin: "20px auto" }}>Nenhum relatório marcado para você.</p>
            ) : (
              <div className="recent-list">{sharedOnly.map(renderSharedCard)}</div>
            )
          )}
        </>
      )}
    </div>
  )
}
