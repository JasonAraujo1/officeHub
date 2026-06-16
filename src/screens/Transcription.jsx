import { useState } from "react"
import { Grid, User, Search, Play, Skip } from "../icons.jsx"
import WaveHeader from "../components/WaveHeader.jsx"
import { transcript, report } from "../data.js"

export default function Transcription({ go }) {
  const [tab, setTab] = useState("texto")

  return (
    <div className="screen">
      <WaveHeader compact>
        <div className="topbar">
          <button className="icon-btn ghost"><Grid /></button>
          <div className="title">Transcrição</div>
          <button className="icon-btn ghost"><User /></button>
        </div>
      </WaveHeader>

      <div className="tabs">
        <button className={tab === "texto" ? "active" : ""} onClick={() => setTab("texto")}>Texto</button>
        <button className={tab === "resumo" ? "active" : ""} onClick={() => setTab("resumo")}>Resumo</button>
      </div>

      {tab === "texto" ? (
        <>
          <div className="search">
            <Search size={18} />
            <input placeholder="Buscar no texto" />
          </div>
          <div className="feed">
            {transcript.map((s, i) => (
              <div className="seg" key={i}>
                <div className="ts">{s.ts}</div>
                <div className={`who ${s.cls}`}>{s.who}</div>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="feed">
          <p className="summary-text">{report.summary}</p>
          <button className="btn-primary" onClick={() => go("report")}>Ver relatório completo</button>
        </div>
      )}

      <div className="miniplayer">
        <div className="progress"><i /><b /></div>
        <div className="time-row"><span>01:24</span><span>06:42</span></div>
        <div className="player-controls">
          <button className="skip"><Skip dir="back" size={24} /></button>
          <button className="play-btn"><Play size={24} /></button>
          <button className="skip"><Skip dir="fwd" size={24} /></button>
        </div>
      </div>
    </div>
  )
}
