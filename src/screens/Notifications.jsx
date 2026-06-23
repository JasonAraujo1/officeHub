import { useEffect, useState } from "react"
import { Back, Bell, Check, X } from "../icons.jsx"
import { subscribeNotifications, markRead, markAllRead, removeNotification } from "../lib/notifications.js"
import { getReport } from "../lib/reports.js"

function timeAgo(v) {
  const d = v?.toDate ? v.toDate() : (v?.seconds ? new Date(v.seconds * 1000) : null)
  if (!d) return ""
  return d.toLocaleDateString("pt-BR") + " · " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}

export default function Notifications({ go }) {
  const [list, setList] = useState([])
  useEffect(() => {
    let unsub
    try { unsub = subscribeNotifications(setList) } catch (e) { console.error(e) }
    return () => unsub && unsub()
  }, [])

  async function openNotif(n) {
    markRead(n.id)
    if (n.type === "report" && n.reportId && n.ownerUid) {
      try {
        const data = await getReport(n.ownerUid, n.reportId)
        if (data) go("report", data)
        else alert("Relatório não encontrado ou sem acesso.")
      } catch (e) { console.error(e) }
    }
  }

  return (
    <div className="screen notif-screen">
      <div className="topbar">
        <button className="round-btn" onClick={() => go("home")} aria-label="Voltar"><Back size={20} /></button>
        <div className="title center">Notificações</div>
        <button className="round-btn" onClick={() => markAllRead(list)} aria-label="Marcar todas como lidas"><Check size={18} /></button>
      </div>

      {list.length === 0 ? (
        <div className="empty">
          <span className="empty-ic"><Bell size={32} /></span>
          <p>Sem notificações</p>
          <span>Você verá aqui quando for marcado ou receber atualizações.</span>
        </div>
      ) : (
        <div className="notif-list">
          {list.map((n) => (
            <div className={`notif${n.read ? "" : " unread"}`} key={n.id} onClick={() => openNotif(n)} style={{ cursor: "pointer" }}>
              {!n.read && <span className="notif-dot" />}
              <span className="notif-info">
                <span className="notif-title">{n.title}</span>
                {n.body && <span className="notif-body">{n.body}</span>}
                <span className="notif-time">{timeAgo(n.createdAt)}</span>
              </span>
              <button className="notif-del" onClick={(e) => { e.stopPropagation(); removeNotification(n.id) }} aria-label="Excluir"><X size={15} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
