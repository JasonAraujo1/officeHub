import { useState } from "react"
import Home from "./screens/Home.jsx"
import Record from "./screens/Record.jsx"
import Transcription from "./screens/Transcription.jsx"
import Report from "./screens/Report.jsx"
import Attachments from "./screens/Attachments.jsx"
import Player from "./screens/Player.jsx"
import { Mic, FileText, Doc } from "./icons.jsx"

const SCREENS = { home: Home, record: Record, transcription: Transcription, report: Report, attachments: Attachments, player: Player }

// Telas que exibem a barra inferior de navegação.
const WITH_NAV = new Set(["attachments", "report", "transcription", "player"])

export default function App() {
  const [screen, setScreen] = useState("home")
  const [payload, setPayload] = useState(null)

  const go = (s, data = null) => {
    setPayload(data)
    setScreen(s)
    window.scrollTo({ top: 0 })
  }

  const Current = SCREENS[screen]

  return (
    <div className="app-shell">
      <Current go={go} item={payload} />

      {WITH_NAV.has(screen) && (
        <nav className="bottom-nav">
          <button
            className={screen === "attachments" ? "active" : ""}
            onClick={() => go("attachments")}
          >
            <FileText size={22} /> Anexos
          </button>

          <button className="mic-tab" onClick={() => go("record")} aria-label="Gravar">
            <Mic size={24} />
          </button>

          <button
            className={screen === "report" ? "active" : ""}
            onClick={() => go("report")}
          >
            <Doc size={22} /> Relatório
          </button>
        </nav>
      )}
    </div>
  )
}
