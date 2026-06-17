import { useState } from "react"
import Home from "./screens/Home.jsx"
import Reports from "./screens/Reports.jsx"
import Report from "./screens/Report.jsx"
import Login from "./screens/Login.jsx"
import { AuthProvider, useAuth } from "./auth.jsx"
import { isConfigured } from "./firebase.js"

const SCREENS = { home: Home, reports: Reports, report: Report }

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
  return (
    <div className="app-shell">
      <Current go={go} item={payload} />
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
