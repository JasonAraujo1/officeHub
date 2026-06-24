import {
  collection, addDoc, onSnapshot, query, orderBy, serverTimestamp,
} from "firebase/firestore"
import { db, auth } from "../firebase.js"

function uid() {
  if (!auth?.currentUser) throw new Error("Usuário não autenticado")
  return auth.currentUser.uid
}

export const SUPPORT_MAX_PER_DAY = 5

export function subscribeSupport(cb) {
  const u = uid()
  return onSnapshot(
    query(collection(db, "users", u, "support"), orderBy("createdAt", "desc")),
    (s) => cb(s.docs.map((d) => ({ id: d.id, ...d.data() })))
  )
}

function isToday(v) {
  const d = v?.toDate ? v.toDate() : (typeof v?.seconds === "number" ? new Date(v.seconds * 1000) : null)
  if (!d) return false
  return d.toDateString() === new Date().toDateString()
}

export function countToday(list) {
  return (list || []).filter((r) => isToday(r.createdAt)).length
}

export async function createSupportRequest(category, message = "") {
  const u = uid()
  await addDoc(collection(db, "users", u, "support"), {
    category, message: message || "", status: "open", createdAt: serverTimestamp(),
  })
}
