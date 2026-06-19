import { useState } from "react"
import { Back, Share, Check, Download } from "../icons.jsx"
import AudioPlayer from "../components/AudioPlayer.jsx"
import { generateReportPdf, generateTranscriptPdf } from "../lib/pdf.js"

const SPEAKER_CLS = ["", "s2", "s3", ""]

export default function Report({ go, item }) {
  const [tab, setTab] = useState("resumo")
  const r = item || {}
  const summary = r.summary || {}
  const transcript = r.transcript || []

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
    </div>
  )
}
