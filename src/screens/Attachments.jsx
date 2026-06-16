import { Back, Search, Play, More, Plus } from "../icons.jsx"
import WaveHeader from "../components/WaveHeader.jsx"
import { attachments } from "../data.js"

export default function Attachments({ go }) {
  return (
    <div className="screen">
      <WaveHeader compact>
        <div className="topbar">
          <button className="icon-btn ghost" onClick={() => go("home")}><Back /></button>
          <div className="title">Anexos</div>
          <span style={{ width: 40 }} />
        </div>
      </WaveHeader>

      <div className="search">
        <Search size={18} />
        <input placeholder="Buscar anexos" />
      </div>

      <div className="card list">
        {attachments.map((a) => (
          <button key={a.name} className="att" onClick={() => go("player", a)}>
            <span className="play"><Play size={16} /></span>
            <span className="info">
              <span className="name">{a.name}</span>
              <span className="sub">{a.date} · {a.time}</span>
            </span>
            <span className="dur">{a.dur}</span>
            <span className="more"><More size={18} /></span>
          </button>
        ))}
      </div>

      <button className="fab" onClick={() => go("record")} aria-label="Nova gravação">
        <Plus size={24} />
      </button>
    </div>
  )
}
