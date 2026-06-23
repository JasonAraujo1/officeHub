import { useState, useEffect } from "react"
import { Back, Share, Check, Download, Users, X } from "../icons.jsx"
import AudioPlayer from "../components/AudioPlayer.jsx"
import { generateReportPdf, generateTranscriptPdf } from "../lib/pdf.js"
import { useAuth } from "../auth.jsx"
import { subscribeConnections } from "../lib/team.js"
import { notify } from "../lib/notifications.js"
import { setReportTags } from "../lib/reports.js"

const SPEAKER_CLS = ["", "s2", "s3", ""]

export default function Report({ go, item }) {
  const [tab, setTab] = useState("resumo")
  const r = item || {}
  const summary = r.summary || {}
  const transcript = r.transcript || []
  const { user } = useAuth()
  const [connections, setConnections] = useState([])
  const [tagOpen, setTagOpen] = useState(false)
  const [sel, setSel] = useState(r.taggedUids || [])

  useEffect(() => {
    let unsub
    try { unsub = subscribeConnections(setConnections) } catch (e) { console.error(e) }
    return () => unsub && unsub()
  }, [])

  const people = [{ uid: user?.uid, name: "Eu mesmo", email: user?.email }, ...connections]
  const toggleSel = (id) => setSel((arr) => arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id])
  async function saveTags() {
    const names = people.filter((p) => sel.includes(p.uid)).map((p) => p.name)
    try {
      await setReportTags(r, sel, names)
      for (const id of sel) {
        if (id && id !== user?.uid) notify(id, { title: `Você foi marcado no relatório "${r.title || "Relatório"}"`, type: "report", reportId: r.id, ownerUid: user?.uid }).catch(() => {})
      }
    } catch (e) { console.error(e); alert("Não foi possível salvar a marcação.") }
    setTagOpen(false)
  }

  return (
    <div className="screen report-screen">
      <div className="topbar">
        <button className="round-btn" onClick={() => go("reports")} aria-label="Voltar"><Back size={20} /></button>
        <div className="title center">Relatório</div>
        <button className="round-btn" onClick={() => generateReportPdf(r)} title="Exportar PDF" aria-label="Exportar PDF"><Share size={18} /></button>
      </div>

      <h1 className="report-title">{r.title || "Relatório"}</h1>

      <div className="meta-row">
        <div className="meta">
          <div className="k">Duração</div>
          <div className="v">{r.durationSec ? `${Math.round(r.durationSec / 60)} min` : "—"}</div>
        </div>
        <div className="meta">
          <div className="k">Interlocutores</div>
          <div className="v">{r.speakers || transcript.length ? (r.speakers || "—") : "—"}</div>
        </div>
      </div>

      <div className="tag-bar">
        <button className="pill ghost" style={{ borderRadius: 14 }} onClick={() => { setSel(r.taggedUids || []); setTagOpen(true) }}>
          <Users size={16} /> Marcar usuários
        </button>
        {(r.taggedNames || []).map((n, i) => <span className="person-chip" key={i}>@{n}</span>)}
      </div>

      {r.audioUrl && <AudioPlayer src={r.audioUrl} wavePlayed="#000000" waveRest="rgba(0,0,0,0.3)" sideBg="#f0bba1" />}

      <div className="tabs">
        <button className={tab === "resumo" ? "active" : ""} onClick={() => setTab("resumo")}>Resumo</button>
        <button className={tab === "completo" ? "active" : ""} onClick={() => setTab("completo")}>Completo</button>
        <button className={tab === "transcricao" ? "active" : ""} onClick={() => setTab("transcricao")}>Transcrição</button>
      </div>

      {tab === "resumo" && (
        <div className="feed">
          {summary.abstract && <p className="summary-text">{summary.abstract}</p>}

          {summary.topics?.length > 0 && (
            <>
              <div className="section-h">Tópicos Principais</div>
              <ul className="check-list">
                {summary.topics.map((t, i) => (
                  <li key={i}><span className="tick"><Check size={13} stroke={3} /></span>{t}</li>
                ))}
              </ul>
            </>
          )}

          {summary.actions?.length > 0 && (
            <>
              <div className="section-h">Ações Sugeridas</div>
              <ul className="check-list">
                {summary.actions.map((a, i) => (
                  <li key={i}><span className="tick m"><Check size={13} stroke={3} /></span>{a}</li>
                ))}
              </ul>
            </>
          )}

          {!summary.abstract && !summary.topics?.length && (
            <p className="rec-status-msg">Resumo indisponível.</p>
          )}
        </div>
      )}

      {tab === "completo" && (
        <div className="feed">
          {(r.analysis || r.fullReport) && (
            <>
              <div className="section-h">Análise do Diálogo</div>
              <p className="summary-text" style={{ whiteSpace: "pre-wrap" }}>{r.analysis || r.fullReport}</p>
            </>
          )}

          {r.requested?.length > 0 && (
            <>
              <div className="section-h">O que foi pedido</div>
              <ul className="check-list">
                {r.requested.map((t, i) => (
                  <li key={i}><span className="tick"><Check size={13} stroke={3} /></span>{t}</li>
                ))}
              </ul>
            </>
          )}

          {r.done?.length > 0 && (
            <>
              <div className="section-h">O que foi feito</div>
              <ul className="check-list">
                {r.done.map((t, i) => (
                  <li key={i}><span className="tick"><Check size={13} stroke={3} /></span>{t}</li>
                ))}
              </ul>
            </>
          )}

          {(r.toDo?.length > 0 || r.summary?.actions?.length > 0) && (
            <>
              <div className="section-h">O que se quer que seja feito</div>
              <ul className="check-list">
                {(r.toDo?.length ? r.toDo : r.summary.actions).map((t, i) => (
                  <li key={i}><span className="tick m"><Check size={13} stroke={3} /></span>{t}</li>
                ))}
              </ul>
            </>
          )}

          {!(r.analysis || r.fullReport) && !r.requested?.length && !r.done?.length && !r.toDo?.length && (
            <p className="rec-status-msg">Relatório completo indisponível.</p>
          )}
        </div>
      )}

      {tab === "transcricao" && (
        <div className="feed">
          {transcript.length > 0 ? transcript.map((s, i) => (
            <div className="seg" key={i}>
              {s.start != null && <div className="ts">{s.start}</div>}
              <div className={`who ${SPEAKER_CLS[(s.speakerIndex ?? i) % 4]}`}>
                {s.speaker || `Interlocutor ${i + 1}`}
              </div>
              <p>{s.text}</p>
            </div>
          )) : <p className="rec-status-msg">Transcrição indisponível.</p>}
        </div>
      )}

      <button className="btn-primary" onClick={() => generateReportPdf(r)}><Download size={18} /> Exportar PDF</button>
      <button className="btn-primary" style={{ background: "#f0bba1", color: "#000", border: "none", marginTop: 12 }} onClick={() => generateTranscriptPdf(r)}><Download size={18} /> Baixar Descrição Completa</button>

      {tagOpen && (
        <div className="modal-overlay" onClick={() => setTagOpen(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-grip" />
            <div className="modal-title">Marcar usuários</div>
            <div className="modal-sub">Marque você ou pessoas conectadas neste relatório.</div>
            <div className="type-chips">
              {people.map((pp) => (
                <button key={pp.uid} className={`type-chip${sel.includes(pp.uid) ? " active" : ""}`} onClick={() => toggleSel(pp.uid)}>
                  @{pp.name}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button className="pill ghost" style={{ flex: 1, borderRadius: 16 }} onClick={() => setTagOpen(false)}><X size={18} /> Cancelar</button>
              <button className="pill" style={{ flex: 1, borderRadius: 16 }} onClick={saveTags}><Check size={18} /> Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
