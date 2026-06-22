import {
  collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp,
} from "firebase/firestore"
import { db, auth } from "../firebase.js"

function uid() {
  if (!auth?.currentUser) throw new Error("Usuário não autenticado")
  return auth.currentUser.uid
}

// Quadro de atividades (kanban) compartilhado entre usuários conectados.
// status: "todo" | "doing" | "done"
export function subscribeTasks(cb) {
  const q = query(collection(db, "tasks"), orderBy("createdAt", "desc"))
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
}

export async function createTask({ title, detail = "", status = "todo", assignedTo = "", assignedName = "", allowMembersMove = false }) {
  const u = uid()
  await addDoc(collection(db, "tasks"), {
    title, detail, status, assignedTo, assignedName, allowMembersMove,
    ownerUid: u, createdAt: serverTimestamp(),
  })
}

export async function updateTaskStatus(task, status) {
  await updateDoc(doc(db, "tasks", task.id), { status })
}

export async function assignTask(task, { assignedTo, assignedName, allowMembersMove }) {
  await updateDoc(doc(db, "tasks", task.id), {
    assignedTo: assignedTo || "",
    assignedName: assignedName || "",
    allowMembersMove: !!allowMembersMove,
  })
}

export async function deleteTask(task) {
  await deleteDoc(doc(db, "tasks", task.id))
}
