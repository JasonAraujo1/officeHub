import {
  collection, doc, setDoc, onSnapshot, query, orderBy, serverTimestamp,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
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

  // 1) cria o documento do relatório (status inicial)
  await setDoc(doc(db, "users", u, "reports", id), {
    id,
    title: title || "Gravação",
    status: "processing",
    progress: 5,
    stage: "Enviando áudio",
    durationSec,
    createdAt: serverTimestamp(),
  })

  // 2) upload do áudio — isso dispara a Cloud Function que processa e
  //    atualiza o documento com a transcrição e os relatórios.
  await uploadBytes(ref(storage, path), blob, { contentType: blob.type || "audio/webm" })
  const audioUrl = await getDownloadURL(ref(storage, path))

  // 3) salva a URL do áudio no documento (para reprodução)
  await setDoc(doc(db, "users", u, "reports", id), { audioUrl }, { merge: true })

  return id
}

// Assina a lista de relatórios do usuário em tempo real.
export function subscribeReports(cb) {
  const u = uid()
  const q = query(collection(db, "users", u, "reports"), orderBy("createdAt", "desc"))
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => d.data())))
}
