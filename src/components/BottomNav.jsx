import { Home, FileText, Calendar, Grid } from "../icons.jsx"

// Barra de navegação inferior escura e flutuante (estilo do mockup).
const TABS = [
  { key: "home", Icon: Home, label: "Início" },
  { key: "reports", Icon: FileText, label: "Relatórios" },
  { key: "calendar", Icon: Calendar, label: "Calendário" },
  { key: "widgets", Icon: Grid, label: "Mais" },
]

export default function BottomNav({ active = "home", go }) {
  return (
    <nav className="bottom-nav">
      {TABS.map(({ key, Icon, label }) => (
        <button
          key={key}
          className={key === active ? "active" : ""}
          onClick={() => go?.(key)}
          aria-label={label}
          aria-current={key === active ? "page" : undefined}
        >
          <Icon size={23} />
        </button>
      ))}
    </nav>
  )
}
