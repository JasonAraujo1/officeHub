import {
  collection, doc, setDoc, updateDoc, getDocs, onSnapshot, query, where, serverTimestamp,
} from "firebase/firestore"
import { db, auth } from "../firebase.js"
import { notify } from "./notifications.js"

function me() {
  if (!auth?.currentUser) throw new Error("Usuário não autenticado")
  return auth.currentUser
}
const myName = (u) => u.displayName || u.email?.split("@")[0] || "usuário"

// Cria/atualiza o perfil público do usuário (para busca por e-mail).
export async function ensureProfile(user) {
  if (!user) return
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    name: user.displayName || user.email?.split("@")[0] || "usuário",
    email: (user.email || "").toLowerCase(),
  }, { merge: true })
}

export function subscribeProfile(cb) {
  const u = me()
  return onSnapshot(doc(db, "users", u.uid), (d) => cb(d.exists() ? d.data() : null))
}

export async function setController(value) {
  const u = me()
  await setDoc(doc(db, "users", u.uid), { isController: !!value }, { merge: true })
}

// Procura o usuário pelo e-mail e cria uma solicitação (entregue dentro do app).
export async function inviteByEmail(email, role = "") {
  const u = me()
  const target = (email || "").trim().toLowerCase()
  if (!target) throw new Error("Informe um e-mail.")
  if (target === (u.email || "").toLowerCase()) throw new Error("Você não pode adicionar a si mesmo.")
  const snap = await getDocs(query(collection(db, "users"), where("email", "==", target)))
  if (snap.empty) throw new Error("Nenhum usuário com esse e-mail no app.")
  const t = snap.docs[0].data()
  const id = `${u.uid}_${t.uid}`
  const fn = (role || "").trim()
  await setDoc(doc(db, "invitations", id), {
    id,
    fromUid: u.uid, fromName: myName(u), fromEmail: (u.email || "").toLowerCase(),
    toUid: t.uid, toEmail: t.email, role: fn,
    status: "pending", createdAt: serverTimestamp(),
  })
  // avisa o convidado (vira push) — ele aceita/recusa em Configurações
  notify(t.uid, {
    title: `${myName(u)} convidou você para a equipe`,
    body: fn ? `Função: ${fn}. Abra Configurações para aceitar ou recusar.` : "Abra Configurações para aceitar ou recusar.",
    type: "invite",
  }).catch(() => {})
  return t
}

export function subscribeIncoming(cb) {
  const u = me()
  return onSnapshot(
    query(collection(db, "invitations"), where("toUid", "==", u.uid), where("status", "==", "pending")),
    (s) => cb(s.docs.map((d) => d.data()))
  )
}

export async function acceptInvite(inv) {
  const u = me()
  await updateDoc(doc(db, "invitations", inv.id), { status: "accepted" })
  await setDoc(doc(db, "users", u.uid, "connections", inv.fromUid), {
    uid: inv.fromUid, name: inv.fromName, email: inv.fromEmail, role: inv.role || "", since: serverTimestamp(),
  })
  await setDoc(doc(db, "users", inv.fromUid, "connections", u.uid), {
    uid: u.uid, name: myName(u), email: (u.email || "").toLowerCase(), role: inv.role || "", since: serverTimestamp(),
  })
  notify(inv.fromUid, {
    title: `${myName(u)} aceitou entrar na equipe`,
    body: inv.role ? `Função: ${inv.role}.` : "",
    type: "info",
  }).catch(() => {})
}

export async function declineInvite(inv) {
  await updateDoc(doc(db, "invitations", inv.id), { status: "declined" })
}

export function subscribeConnections(cb) {
  const u = me()
  return onSnapshot(collection(db, "users", u.uid, "connections"), (s) => cb(s.docs.map((d) => d.data())))
}
