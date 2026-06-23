import { useState, useEffect } from "react"
import Home from "./screens/Home.jsx"
import Reports from "./screens/Reports.jsx"
import Report from "./screens/Report.jsx"
import Calendar from "./screens/Calendar.jsx"
import Widgets from "./screens/Widgets.jsx"
import Record from "./screens/Record.jsx"
import Attach from "./screens/Attach.jsx"
import Profile from "./screens/Profile.jsx"
import Settings from "./screens/Settings.jsx"
import Support from "./screens/Support.jsx"
import Notifications from "./screens/Notifications.jsx"
import Login from "./screens/Login.jsx"
import BottomNav from "./components/BottomNav.jsx"
import { AuthProvider, useAuth } from "./auth.jsx"
import { isConfigured } from "./firebase.js"

const SCREENS = { home: Home, reports: Reports, report: Report, calendar: Calendar, widgets: Widgets, record: Record, attach: Attach, profile: Profile, settings: Settings, support: Support, notifications: Notifications }
const NAV_TABS = ["home", "reports", "calendar", "widgets"]

// Cor do topo (barra de status) por tela — para a barra "continuar" a tela.
const SCREEN_THEME = {
  home: "#ffffff",
  reports: "#ffc7ab",
  report: "#ffc7ab",
  calendar: "#c9a6f0",
  widgets: "#ffffff",
  record: "#b7ffa9",
  attach: "#b7ffa9",
  notifications: "#ffe7a3",
  profile: "#cfe2fe",
  settings: "#cfe2fe",
  support: "#cfe2fe",
}
function setThemeColor(color) {
  const m = document.querySelector('meta[name="theme-color"]')
  if (m) m.setAttribute("content", color)
  // faz as áreas seguras (notch / barra inferior) herdarem a cor da tela,
  // em vez de aparecerem pretas — equivalente web do SafeAreaView.
  document.body.style.backgroundColor = color
  document.documentElement.style.backgroundColor = color
}

function Shell() {
  const { user, loading } = useAuth()
  const [screen, setScreen] = useState("home")
  const [payload, setPayload] = useState(null)

  const go = (s, data = null) => { setPayload(data); setScreen(s); window.scrollTo({ top: 0 }) }

  useEffect(() => {
    const color = !user ? "#ffffff" : (SCREEN_THEME[screen] || "#ffffff")
    setThemeColor(color)
  }, [screen, user, loading])

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
