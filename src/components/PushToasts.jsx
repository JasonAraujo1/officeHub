import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell } from "../icons.jsx"
import { useAuth } from "../auth.jsx"
import { subscribeNotifications, markRead } from "../lib/notifications.js"

// Pop-up (toast) que aparece quando chega uma notificação nova — complementa a
// aba de Notificações e o sininho. Clicar abre a aba e marca como lida.
export default function PushToasts({ go }) {
  const { user } = useAuth()
  const [toasts, setToasts] = useState([])
  const seen = useRef(null)

  useEffect(() => {
    if (!user) { seen.current = null; return }
    let unsub
    try {
      unsub = subscribeNotifications((list) => {
        // primeira carga: registra o que já existe, sem disparar toast
        if (seen.current === null) {
          seen.current = new Set(list.map((n) => n.id))
          return
        }
        const fresh = list.filter((n) => !seen.current.has(n.id))
        fresh.forEach((n) => {
          seen.current.add(n.id)
          setToasts((t) => [...t, n])
          setTimeout(() => setToasts((t) => t.filter((x) => x.id !== n.id)), 5500)
        })
      })
    } catch (e) { console.error(e) }
    return () => unsub && unsub()
  }, [user])

  const open = (n) => {
    setToasts((t) => t.filter((x) => x.id !== n.id))
    markRead(n.id).catch(() => {})
    go?.("notifications")
  }
  const dismiss = (e, n) => { e.stopPropagation(); setToasts((t) => t.filter((x) => x.id !== n.id)) }

  return (
    <div className="toast-wrap">
      <AnimatePresence initial={false}>
        {toasts.map((n) => (
          <motion.div className="toast" key={n.id} onClick={() => open(n)}
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}>
            <span className="toast-ic"><Bell size={18} /></span>
            <div className="toast-body">
              <div className="toast-title">{n.title}</div>
              {n.body && <div className="toast-sub">{n.body}</div>}
            </div>
            <button className="toast-x" onClick={(e) => dismiss(e, n)} aria-label="Fechar">✕</button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
