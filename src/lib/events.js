import {
  collection, collectionGroup, doc, setDoc, deleteDoc, onSnapshot, query, where, serverTimestamp,
} from "firebase/firestore"
import { db, auth } from "../firebase.js"

function uid() {
  if (!auth?.currentUser) throw new Error("Usuário não autenticado")
  return auth.currentUser.uid
}

// Cria um evento/tarefa do calendário.
export async function createEvent({ title, type, day, month, year, time = "—", taggedUids = [], taggedNames = [] }) {
  const u = uid()
  const id = crypto.randomUUID?.() || String(Date.now())
  await setDoc(doc(db, "users", u, "events", id), {
    id, ownerUid: u, title, type, day, month, year, time, taggedUids, taggedNames,
    createdAt: serverTimestamp(),
  })
  return id
}

// Assina os eventos do usuário em tempo real.
export function subscribeEvents(cb) {
  const u = uid()
  const q = query(collection(db, "users", u, "events"))
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => d.data())))
}

// Exclui um evento.
// Eventos de outros usuários em que EU fui marcado (aparecem no meu calendário).
export function subscribeTaggedEvents(cb) {
  const u = uid()
  const qy = query(collectionGroup(db, "events"), where("taggedUids", "array-contains", u))
  return onSnapshot(qy, (s) => cb(s.docs.map((d) => d.data())))
}

export async function deleteEvent(ev) {
  const u = uid()
  await deleteDoc(doc(db, "users", u, "events", ev.id))
}
