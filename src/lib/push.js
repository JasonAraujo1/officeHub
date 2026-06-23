import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { db, auth } from "../firebase.js"

let _msg = null
async function getMsg() {
  if (_msg) return _msg
  if (!(await isSupported().catch(() => false))) return null
  _msg = getMessaging() // usa o app padrão já inicializado em firebase.js
  return _msg
}

// Pede permissão, registra o SW, gera o token FCM e salva no Firestore.
export async function enablePush() {
  const m = await getMsg()
  if (!m) throw new Error("Notificações não são suportadas neste navegador.")
  if (!("Notification" in window)) throw new Error("Navegador sem suporte a notificações.")

  const perm = await Notification.requestPermission()
  if (perm !== "granted") throw new Error("Permissão de notificação negada.")

  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY
  if (!vapidKey) throw new Error("Falta a chave VAPID (VITE_FIREBASE_VAPID_KEY).")

  const reg = await navigator.serviceWorker.register("/firebase-messaging-sw.js")
  const token = await getToken(m, { vapidKey, serviceWorkerRegistration: reg })
  if (!token) throw new Error("Não foi possível gerar o token de push.")

  const u = auth.currentUser
  if (!u) throw new Error("Usuário não autenticado.")
  await setDoc(doc(db, "users", u.uid, "pushTokens", token), {
    token, createdAt: serverTimestamp(), ua: navigator.userAgent.slice(0, 180),
  })
  return token
}

// Já está autorizado a receber push?
export function pushStatus() {
  if (typeof Notification === "undefined") return "unsupported"
  return Notification.permission // "default" | "granted" | "denied"
}

// Notificações em primeiro plano (app aberto) — mostra um aviso nativo.
export async function listenForeground() {
  const m = await getMsg()
  if (!m) return () => {}
  return onMessage(m, (payload) => {
    const n = payload.notification || {}
    if (Notification.permission === "granted") {
      new Notification(n.title || "Controlaí", { body: n.body || "", icon: "/icons/icon.svg" })
    }
  })
}
