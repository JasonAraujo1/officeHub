import { useEffect, useState } from "react"
import { Bell as BellIcon } from "../icons.jsx"
import { subscribeNotifications } from "../lib/notifications.js"

export default function Bell({ go }) {
  const [unread, setUnread] = useState(0)
  useEffect(() => {
    let unsub
    try { unsub = subscribeNotifications((list) => setUnread(list.filter((n) => !n.read).length)) } catch (e) {}
    return () => unsub && unsub()
  }, [])
  return (
    <button className="round-btn bell-btn" onClick={() => go("notifications")} aria-label="Notificações">
      <BellIcon size={20} />
      {unread > 0 && <span className="bell-badge">{unread > 9 ? "9+" : unread}</span>}
    </button>
  )
}
