import {
  collection, doc, addDoc, getDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp,
} from "firebase/firestore"
import { db, auth } from "../firebase.js"

function uid() {
  if (!auth?.currentUser) throw new Error("Usuário não autenticado")
  return auth.currentUser.uid
}

export function subscribeNotes(cb) {
  const u = uid()
  return onSnapshot(
    query(collection(db, "users", u, "notes"), orderBy("createdAt", "desc")),
    (s) => cb(s.docs.map((d) => ({ id: d.id, ...d.data() })))
  )
}

// Cria uma nota. Aceita um objeto com título, texto, tipo (note|checklist),
// itens do checklist e vínculo opcional com um evento.
export async function createNote(data = {}) {
  const u = uid()
  const note = {
    title: (data.title || "").toString(),
    text: (data.text || "").toString(),
    kind: data.kind === "checklist" ? "checklist" : "note",
    items: Array.isArray(data.items) ? data.items : [],
    eventId: data.eventId || "",
    eventTitle: data.eventTitle || "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
  const ref = await addDoc(collection(db, "users", u, "notes"), note)
  return ref.id
}

export async function updateNote(id, patch = {}) {
  const u = uid()
  await updateDoc(doc(db, "users", u, "notes", id), { ...patch, updatedAt: serverTimestamp() })
}

export async function getNote(id) {
  const u = uid()
  const snap = await getDoc(doc(db, "users", u, "notes", id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function deleteNote(id) {
  const u = uid()
  await deleteDoc(doc(db, "users", u, "notes", id))
}
