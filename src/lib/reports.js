import {
  collection, collectionGroup, doc, getDoc, setDoc, deleteDoc, updateDoc, arrayUnion, onSnapshot, query, where, orderBy, serverTimestamp,
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

  // modelo de formatação salvo pelo usuário (prompt/documento de referência),
  // gravado no relatório para a Cloud Function aplicar ao gerar a análise.
  let formatPrompt = ""
  try {
    const prof = await getDoc(doc(db, "users", u))
    formatPrompt = (prof.exists() && prof.data().reportPrompt) || ""
  } catch (e) { /* sem modelo: segue padrão */ }

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
    formatPrompt,
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

// Assina os relatórios COMPARTILHADOS comigo. Em vez de um collectionGroup
// (que exige índice), derivo das notificações de marcação (que já trazem
// reportId + ownerUid) e busco cada relatório com getReport — leitura direta,
// permitida pela regra (estou em taggedUids).
export function subscribeSharedReports(cb) {
  const u = uid()
  const q = query(collection(db, "users", u, "notifications"))
  return onSnapshot(q, async (snap) => {
    const pairs = new Map() // reportId -> ownerUid (dedupe)
    snap.docs.forEach((d) => {
      const n = d.data()
      if (n.type === "report" && n.reportId && n.ownerUid) pairs.set(n.reportId, n.ownerUid)
    })
    const results = await Promise.all(
      [...pairs.entries()].map(async ([rid, owner]) => {
        try { return await getReport(owner, rid) } catch { return null }
      })
    )
    cb(results.filter((r) => r && r.status))
  })
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

// Lê um relatório específico (de qualquer dono) — usado ao abrir pela notificação.
export async function getReport(ownerUid, reportId) {
  const snap = await getDoc(doc(db, "users", ownerUid, "reports", reportId))
  return snap.exists() ? snap.data() : null
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
