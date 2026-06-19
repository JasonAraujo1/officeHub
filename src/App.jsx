import { useState } from "react"
import Home from "./screens/Home.jsx"
import Reports from "./screens/Reports.jsx"
import Report from "./screens/Report.jsx"
import Calendar from "./screens/Calendar.jsx"
import Widgets from "./screens/Widgets.jsx"
import Record from "./screens/Record.jsx"
import Attach from "./screens/Attach.jsx"
import Login from "./screens/Login.jsx"
import BottomNav from "./components/BottomNav.jsx"
import { AuthProvider, useAuth } from "./auth.jsx"
import { isConfigured } from "./firebase.js"

const SCREENS = { home: Home, reports: Reports, report: Report, calendar: Calendar, widgets: Widgets, record: Record, attach: Attach }
const NAV_TABS = ["home", "reports", "calendar", "widgets"]

function Shell() {
  const { user, loading } = useAuth()
  const [screen, setScreen] = useState("home")
  const [payload, setPayload] = useState(null)

  const go = (s, data = null) => { setPayload(data); setScreen(s); window.scrollTo({ top: 0 }) }

  if (!isConfigured) {
    return (
      <div className="app-shell"><div className="screen">
        <div className="setup-note">
          <h2>Configuração necessária</h2>
          <p>Copie <code>.env.example</code> para <code>.env</code> e preencha as variáveis do Firebase e do n8n. Veja o <code>SETUP.md</code>.</p>
        </div>
      </div></div>
    )
  }

  if (loading) {
    return <div className="app-shell"><div className="screen"><p className="rec-status-msg" style={{ margin: "auto" }}>Carregando…</p></div></div>
  }

  if (!user) {
    return <div className="app-shell"><Login /></div>
  }

  const Current = SCREENS[screen] || Home
  const showNav = NAV_TABS.includes(screen)
  return (
    <div className="app-shell">
      <Current go={go} item={payload} />
      {showNav && <BottomNav active={screen} go={go} />}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  )
}
