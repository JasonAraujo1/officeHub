import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
import Notes from "./screens/Notes.jsx"
import NoteDetail from "./screens/NoteDetail.jsx"
import Team from "./screens/Team.jsx"
import Dashboard from "./screens/Dashboard.jsx"
import ReportModel from "./screens/ReportModel.jsx"
import AIChat from "./screens/AIChat.jsx"
import Login from "./screens/Login.jsx"
import BottomNav from "./components/BottomNav.jsx"
import PushToasts from "./components/PushToasts.jsx"
import TourGuide from "./components/TourGuide.jsx"
import AIFloating from "./components/AIFloating.jsx"
import { AuthProvider, useAuth } from "./auth.jsx"
import { isConfigured } from "./firebase.js"
import { subscribeProfile, setTourSeen } from "./lib/team.js"

// Passos do tour de boas-vindas (multi-tela).
const TOUR_STEPS = [
  { screen: "home", selector: '[data-tour="home-bell"]', title: "Notificações", body: "Aqui chegam seus avisos: quando alguém te marca num relatório, convites de equipe e lembretes." },
  { screen: "home", selector: '[data-tour="home-stats"]', title: "Visão rápida", body: "Acompanhe seus relatórios e eventos do calendário num relance." },
  { screen: "home", selector: '[data-tour="home-hero"]', title: "Gravar e transcrever", body: "Comece uma gravação ou anexe um áudio para gerar um relatório automático com IA." },
  { screen: "widgets", selector: '[data-tour="fn-shortcuts"]', title: "Funções", body: "Atalhos para tudo: gravação, relatórios, calendário, notas e sua equipe." },
  { screen: "widgets", selector: '[data-tour="fn-config"]', title: "Configurações e suporte", body: "Ajuste sua conta, ative notificações e fale com o suporte por aqui." },
  { screen: "calendar", selector: '[data-tour="cal-grid"]', title: "Calendário", body: "Veja e crie eventos, tarefas e lembretes — e marque pessoas da sua equipe." },
  { screen: "reports", selector: '[data-tour="rpt-top"]', title: "Relatórios", body: "Todos os seus relatórios ficam aqui, junto com os que marcaram você. Tudo pronto!" },
]

const SCREENS = { home: Home, reports: Reports, report: Report, calendar: Calendar, widgets: Widgets, record: Record, attach: Attach, profile: Profile, settings: Settings, support: Support, notifications: Notifications, notes: Notes, note: NoteDetail, team: Team, dashboard: Dashboard, reportmodel: ReportModel, ai: AIChat }
const NAV_TABS = ["home", "reports", "calendar", "widgets"]

// Cor do topo (barra de status) por tela — para a barra "continuar" a tela.
const SCREEN_THEME = {
  home: "#ffffff",
  reports: "#ffc7ab",
  report: "#ffc7ab",
  calendar: "#d8c2f4",
  widgets: "#ffffff",
  record: "#b7ffa9",
  attach: "#b7ffa9",
  notifications: "#ffe7a3",
  profile: "#b7ffa9",
  settings: "#111111",
  support: "#d8c2f4",
  notes: "#cfe2fe",
  note: "#cfe2fe",
  team: "#cfe2fe",
  dashboard: "#cfe2fe",
  reportmodel: "#cfe2fe",
  ai: "#cfe2fe",
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
  const [tourOn, setTourOn] = useState(false)
  const [tourKey, setTourKey] = useState(0)

  const go = (s, data = null) => { setPayload(data); setScreen(s); window.scrollTo({ top: 0 }) }

  useEffect(() => {
    const color = !user ? "#ffffff" : (SCREEN_THEME[screen] || "#ffffff")
    setThemeColor(color)
  }, [screen, user, loading])

  // observa o perfil; inicia o tour no 1º login (tourVisto ausente/false)
  useEffect(() => {
    if (!user) return
    let started = false
    let unsub
    try {
      unsub = subscribeProfile((p) => {
        if (!started && p && p.tourVisto !== true) {
          started = true
          setScreen("home")
          setTourKey((k) => k + 1)
          setTourOn(true)
        }
      })
    } catch (e) { console.error(e) }
    return () => unsub && unsub()
  }, [user])

  // permite "Rever tour" a partir de Configurações
  useEffect(() => {
    const replay = () => { setScreen("home"); setTourKey((k) => k + 1); setTourOn(true) }
    window.addEventListener("controlai:tour", replay)
    return () => window.removeEventListener("controlai:tour", replay)
  }, [])

  const finishTour = () => { setTourOn(false); setTourSeen(true).catch(() => {}) }

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
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}
        >
          <Current go={go} item={payload} />
        </motion.div>
      </AnimatePresence>
      {showNav && <BottomNav active={screen} go={go} />}
      <AIFloating go={go} hidden={screen === "ai"} />
      <PushToasts go={go} />
      {tourOn && <TourGuide key={tourKey} steps={TOUR_STEPS} go={go} currentScreen={screen} onFinish={finishTour} />}
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
