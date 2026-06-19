import {
  collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp,
} from "firebase/firestore"
import { db, auth } from "../firebase.js"

function me() {
  if (!auth?.currentUser) throw new Error("Usuário não autenticado")
  return auth.currentUser
}

// Cria uma notificação para outro usuário (ou para si mesmo).
export async function notify(toUid, { title, body = "", type = "info" }) {
  const id = crypto.randomUUID?.() || String(Date.now() + Math.random())
  await setDoc(doc(db, "users", toUid, "notifications", id), {
    id, title, body, type, read: false, createdAt: serverTimestamp(),
  })
}

export function subscribeNotifications(cb) {
  const u = me()
  return onSnapshot(
    query(collection(db, "users", u.uid, "notifications"), orderBy("createdAt", "desc")),
    (s) => cb(s.docs.map((d) => d.data()))
  )
}

export async function markRead(id) {
  const u = me()
  await updateDoc(doc(db, "users", u.uid, "notifications", id), { read: true })
}

export async function markAllRead(list) {
  const u = me()
  await Promise.all(
    (list || []).filter((n) => !n.read).map((n) => updateDoc(doc(db, "users", u.uid, "notifications", n.id), { read: true }))
  )
}

export async function removeNotification(id) {
  const u = me()
  await deleteDoc(doc(db, "users", u.uid, "notifications", id))
}
