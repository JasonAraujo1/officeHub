import {
  collection, doc, setDoc, deleteDoc, updateDoc, arrayUnion, onSnapshot, query, orderBy, serverTimestamp,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { db, storage, auth } from "../firebase.js"

function uid() {
  if (!auth?.currentUser) throw new Error("Usuário não autenticado")
  return auth.currentUser.uid
}

// Sobe o áudio, cria o doc em "processing" e dispara o n8n.
export async function createReport(blob, { title, durationSec = 0, ext = "webm" } = {}) {
  const u = uid()
  const id = (crypto.randomUUID?.() || String(Date.now()))
  const path = `users/${u}/audios/${id}.${ext}`

  // 1) UPLOAD primeiro — usa HTTPS comum (não o canal de streaming do Firestore),
  //    então funciona mesmo se o Firestore estiver lento. Isso dispara a Cloud Function.
  // a regra do Storage exige audio/*; .webm às vezes vem como "video/webm",
  // então forçamos um contentType de áudio (não afeta a transcrição)
  const contentType = blob.type && blob.type.startsWith("audio/") ? blob.type : "audio/webm"
  await uploadBytes(ref(storage, path), blob, { contentType })
  const audioUrl = await getDownloadURL(ref(storage, path))

  // 2) cria o documento — SEM travar esperando o ack do servidor.
  //    A escrita vai pro cache local na hora e sincroniza em background.
  setDoc(doc(db, "users", u, "reports", id), {
    id,
    title: title || "Gravação",
    status: "processing",
    progress: 5,
    stage: "Enviando áudio",
    durationSec,
    audioUrl,
    createdAt: serverTimestamp(),
  }).catch((e) => console.error("Falha ao criar o doc do relatório:", e))

  return id
}

// Assina a lista de relatórios do usuário em tempo real.
export function subscribeReports(cb) {
  const u = uid()
  const q = query(collection(db, "users", u, "reports"), orderBy("createdAt", "desc"))
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => d.data())))
}

// Exclui o relatório (doc) e o áudio do Storage.
export async function deleteReport(report) {
  const u = uid()
  await deleteDoc(doc(db, "users", u, "reports", report.id))
  if (report.audioUrl) {
    try {
      await deleteObject(ref(storage, report.audioUrl))
    } catch (e) {
      console.warn("Áudio já removido ou inacessível:", e)
    }
  }
}

// Renomeia o título do relatório.
export async function renameReport(report, title) {
  const u = uid()
  await updateDoc(doc(db, "users", u, "reports", report.id), { title })
}

// Define os usuários marcados no relatório.
export async function setReportTags(report, taggedUids, taggedNames) {
  const u = uid()
  await updateDoc(doc(db, "users", u, "reports", report.id), { taggedUids, taggedNames })
}
