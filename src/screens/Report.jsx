import { Back, Share, Check, Download } from "../icons.jsx"
import WaveHeader from "../components/WaveHeader.jsx"
import { report } from "../data.js"

const tickClass = (i) => ["", "m", "l"][i % 3]

export default function Report({ go }) {
  return (
    <div className="screen">
      <WaveHeader compact>
        <div className="topbar">
          <button className="icon-btn" onClick={() => go("attachments")}><Back /></button>
          <div className="title">Relatório</div>
          <button className="icon-btn"><Share size={18} /></button>
        </div>
      </WaveHeader>

      <h1 className="report-title">{report.title}</h1>

      <div className="meta-row">
        <div className="meta">
          <div className="k">Duração</div>
          <div className="v">{report.duration}</div>
        </div>
        <div className="meta">
          <div className="k">Data</div>
          <div className="v">{report.date}</div>
        </div>
      </div>

      <div className="section-h">Resumo</div>
      <p className="summary-text">{report.summary}</p>

      <div className="section-h">Tópicos Principais</div>
      <ul className="check-list">
        {report.topics.map((t, i) => (
          <li key={t}>
            <span className={`tick ${tickClass(i)}`}><Check size={13} stroke={3} /></span>
            {t}
          </li>
        ))}
      </ul>

      <div className="section-h">Ações Sugeridas</div>
      <ul className="check-list">
        {report.actions.map((a, i) => (
          <li key={a}>
            <span className={`tick ${tickClass(i + 1)}`}><Check size={13} stroke={3} /></span>
            {a}
          </li>
        ))}
      </ul>

      <button className="btn-primary"><Download size={18} /> Exportar Relatório</button>
    </div>
  )
}
