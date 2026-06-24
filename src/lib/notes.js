import {
  collection, doc, addDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp,
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

export async function createNote(text) {
  const u = uid()
  await addDoc(collection(db, "users", u, "notes"), { text, createdAt: serverTimestamp() })
}

export async function deleteNote(id) {
  const u = uid()
  await deleteDoc(doc(db, "users", u, "notes", id))
}
