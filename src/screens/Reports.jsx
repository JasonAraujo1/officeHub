import { useEffect, useState } from "react"
import { Back, FileText, Chevron } from "../icons.jsx"
import WaveHeader from "../components/WaveHeader.jsx"
import { subscribeReports, deleteReport } from "../lib/reports.js"

const STATUS_LABEL = {
  processing: "Processando…",
  done: "Pronto",
  error: "Erro",
}

export default function Reports({ go }) {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

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

  return (
    <div className="screen">
      <WaveHeader compact>
        <div className="topbar">
          <button className="icon-btn ghost" onClick={() => go("home")}><Back /></button>
          <div className="title">Relatórios</div>
          <span style={{ width: 40 }} />
        </div>
      </WaveHeader>

      {loading ? (
        <p className="rec-status-msg" style={{ margin: "20px auto" }}>Carregando…</p>
      ) : reports.length === 0 ? (
        <div className="empty">
          <FileText size={40} />
          <p>Nenhum relatório ainda.</p>
          <span>Grave ou anexe um áudio para gerar um relatório.</span>
        </div>
      ) : (
        <div className="recent-list">
          {reports.map((r) => (
            <button
              key={r.id}
              className="recent-card"
              onClick={() => r.status === "done" && go("report", r)}
            >
              <span className="recent-icon"><FileText size={20} /></span>
              <span className="recent-info">
                <span className="r-title" style={{ display: "block" }}>{r.title}</span>

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
                className="del-btn"
                role="button"
                tabIndex={0}
                title="Excluir"
                aria-label="Excluir relatório"
                onClick={(e) => handleDelete(e, r)}
                style={{ marginLeft: 8, padding: 6, color: "#c0392b", display: "inline-flex", cursor: "pointer", flex: "0 0 auto" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                </svg>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
