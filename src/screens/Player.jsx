import { Back, More, Play, Skip, Bookmark, Download, Doc, Share } from "../icons.jsx"
import Waveform from "../components/Waveform.jsx"
import WaveHeader from "../components/WaveHeader.jsx"

export default function Player({ go, item }) {
  const file = item || { name: "reuniao_alinhamento.mp3", dur: "06:42", seed: 1 }

  return (
    <div className="screen player-screen">
      <WaveHeader compact>
        <div className="topbar">
          <button className="icon-btn ghost" onClick={() => go("attachments")}><Back /></button>
          <div className="title" style={{ letterSpacing: "0.5px", textTransform: "none", fontSize: 14 }}>
            {file.name}
          </div>
          <button className="icon-btn ghost"><More /></button>
        </div>
      </WaveHeader>

      <div className="big-wave">
        <Waveform count={70} height={120} played={0.22} seed={file.seed} color="var(--accent)" />
      </div>

      <div className="time-row" style={{ padding: "0 4px" }}>
        <span>01:24</span><span>{file.dur}</span>
      </div>

      <div className="player-big-controls">
        <span className="speed-pill">1.0x</span>
        <button className="skip"><Skip dir="back" size={26} /></button>
        <button className="play-btn lg"><Play size={28} /></button>
        <button className="skip"><Skip dir="fwd" size={26} /></button>
        <button className="bookmark-btn"><Bookmark size={18} /></button>
      </div>

      <div className="action-row">
        <button className="act" onClick={() => go("transcription")}>
          <Download size={20} /> Transcrever
        </button>
        <button className="act" onClick={() => go("report")}>
          <Doc size={20} /> Gerar Relatório
        </button>
        <button className="act">
          <Share size={20} /> Compartilhar
        </button>
      </div>
    </div>
  )
}
