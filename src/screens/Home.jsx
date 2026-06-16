import { Mic, Laptop, MathFn, Bolt, Book, BookOpen, Clock, Check } from "../icons.jsx"
import WaveHeader from "../components/WaveHeader.jsx"
import { subjects, recents } from "../data.js"

const SUBJ_ICON = { laptop: Laptop, math: MathFn, bolt: Bolt, book: Book }

function greeting(h) {
  if (h < 12) return "Bom dia"
  if (h < 18) return "Boa tarde"
  return "Boa noite"
}

export default function Home({ go }) {
  const now = new Date()
  const dateLabel = now.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
  const pretty = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)

  return (
    <div className="screen">
      <WaveHeader>
        <div className="greet-date">{pretty}</div>
        <h1 className="greet-h1">{greeting(now.getHours())}</h1>
        <p className="greet-sub">Pronto para capturar conhecimento?</p>
      </WaveHeader>

      <button className="start-rec" onClick={() => go("record")}>
        <span className="ring"><Mic size={20} /></span>
        Iniciar Gravação
      </button>

      <div className="dash-section">
        <h2>Matérias de Hoje</h2>
        <button className="link" onClick={() => go("attachments")}>Ver todas</button>
      </div>

      <div className="subj-grid">
        {subjects.map((s) => {
          const Ic = SUBJ_ICON[s.icon] || Book
          return (
            <button key={s.name} className="subj-card" onClick={() => go("attachments")}>
              <span className={`tile ${s.tile}`}><Ic size={22} /></span>
              <span>
                <span className="subj-name">{s.name}</span>
                <span className="subj-meta" style={{ display: "block" }}>
                  {s.notes} {s.notes === 1 ? "nota" : "notas"}
                </span>
              </span>
            </button>
          )
        })}
      </div>

      <div className="dash-section">
        <h2><span className="clk"><Clock size={18} /></span> Recentes</h2>
      </div>

      <div className="recent-list">
        {recents.map((r, i) => (
          <button key={i} className="recent-card" onClick={() => go("player")}>
            <span className="recent-icon"><BookOpen size={20} /></span>
            <span className="recent-info">
              <span className="r-title" style={{ display: "block" }}>{r.subject}</span>
              <span className="r-meta" style={{ display: "block" }}>
                {r.date} · {r.time} · {r.dur}
              </span>
            </span>
            <span className="recent-check"><Check size={15} stroke={3} /></span>
          </button>
        ))}
      </div>
    </div>
  )
}
