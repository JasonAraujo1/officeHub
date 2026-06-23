import { Back, Mail, Chat, Help } from "../icons.jsx"
import { useAuth } from "../auth.jsx"

const SUPPORT_EMAIL = "suporte@controllerhub.app"

export default function Support({ go }) {
  const { user } = useAuth()
  const mailto = `mailto:${SUPPORT_EMAIL}?subject=Suporte%20controllerHub&body=Conta:%20${encodeURIComponent(user?.email || "")}%0A%0ADescreva%20sua%20dúvida%20ou%20problema:%0A`

  return (
    <div className="screen fn-sub-screen support-screen">
      <div className="topbar">
        <button className="round-btn" onClick={() => go("widgets")} aria-label="Voltar"><Back size={20} /></button>
        <div className="title center">Suporte</div>
        <span style={{ width: 44 }} />
      </div>

      <div className="profile-head" style={{ paddingTop: 18 }}>
        <div className="profile-avatar" style={{ background: "#8fb6f0", color: "#0a335f" }}><Help size={34} /></div>
        <div className="profile-name">Como podemos ajudar?</div>
        <div className="profile-email">Fale com a gente ou tire suas dúvidas.</div>
      </div>

      <div className="settings-section">Contato</div>
      <div className="list-card">
        <a className="row-item" href={mailto}>
          <span className="row-ic"><Mail size={18} /></span>
          <span className="row-label">Enviar e-mail<br /><span className="row-label sub">{SUPPORT_EMAIL}</span></span>
        </a>
        <a className="row-item" href="https://wa.me/" target="_blank" rel="noreferrer">
          <span className="row-ic"><Chat size={18} /></span>
          <span className="row-label">WhatsApp</span>
        </a>
      </div>

      <div className="settings-section">Dúvidas frequentes</div>
      <div className="list-card">
        <div className="row-item static">
          <span className="row-label">Como gerar um relatório?<br /><span className="row-label sub">Toque em "Iniciar" para gravar ou "Anexar" para enviar um áudio. O relatório aparece na aba Relatórios.</span></span>
        </div>
        <div className="row-item static">
          <span className="row-label">Posso editar o nome de um relatório?<br /><span className="row-label sub">Sim — toque no ícone de lápis no card do relatório.</span></span>
        </div>
        <div className="row-item static">
          <span className="row-label">Como adiciono uma tarefa?<br /><span className="row-label sub">Na aba Calendário, toque em um dia ou num widget de categoria.</span></span>
        </div>
      </div>
    </div>
  )
}
