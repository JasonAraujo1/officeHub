import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { httpsCallable } from "firebase/functions"
import { db, auth, functions } from "../firebase.js"

function uid() {
  if (!auth?.currentUser) throw new Error("Usuário não autenticado")
  return auth.currentUser.uid
}

// Questionário (10 perguntas) que alimenta a IA antes de liberar o chat.
// type: "choice" (opções) ou "text" (resposta livre).
export const SURVEY = [
  { id: "size", q: "Quantos funcionários a empresa/equipe tem?", type: "choice", options: ["1–5", "6–15", "16–50", "51–200", "200+"] },
  { id: "area", q: "Qual o segmento ou área de atuação?", type: "text", ph: "Ex.: escritório de advocacia, agência, indústria…" },
  { id: "uses", q: "Vocês já usam gestão ágil?", type: "choice", options: ["Sim, de forma consistente", "Em parte / informalmente", "Não, ainda não"] },
  { id: "frameworks", q: "Quais frameworks/práticas conhecem ou usam?", type: "choice", options: ["Scrum", "Kanban", "Scrum + Kanban", "Outros", "Nenhum"] },
  { id: "cadence", q: "Com que frequência fazem reuniões de equipe?", type: "choice", options: ["Diária", "Semanal", "Quinzenal", "Mensal", "Raramente"] },
  { id: "teams", q: "Qual o tamanho médio dos times?", type: "choice", options: ["Até 3", "4–8", "9–15", "16+"] },
  { id: "tools", q: "Quais ferramentas de gestão já utilizam?", type: "text", ph: "Ex.: Trello, planilhas, WhatsApp, nenhuma…" },
  { id: "docs", q: "Como documentam decisões e tarefas hoje?", type: "text", ph: "Ex.: atas, mensagens, nada formal…" },
  { id: "pain", q: "Qual a maior dificuldade na gestão hoje?", type: "text", ph: "Ex.: prazos, comunicação, acompanhamento…" },
  { id: "goal", q: "O que você espera da IA do Controlaí?", type: "text", ph: "Ex.: melhorar reuniões, criar pautas, padronizar relatórios…" },
]

export async function saveSurvey(answers) {
  const u = uid()
  await setDoc(doc(db, "users", u), { aiSurvey: answers, aiSurveyDone: true, aiSurveyAt: serverTimestamp() }, { merge: true })
}

// Chama a Cloud Function de chat (Groq via callable). Envia histórico, questionário e contexto do app.
export async function callChat(messages, survey, context = "") {
  if (!functions) throw new Error("Funções indisponíveis")
  const fn = httpsCallable(functions, "chatAgile")
  const res = await fn({ messages, survey, context })
  return res.data?.reply || ""
}

// Monta um resumo COMPACTO dos dados do app para a IA responder sobre as atividades.
function d2(v) {
  const d = v?.toDate ? v.toDate() : (typeof v?.seconds === "number" ? new Date(v.seconds * 1000) : null)
  return d ? d.toLocaleDateString("pt-BR") : ""
}
export function buildAppContext({ reports = [], events = [], tasks = [], notes = [] } = {}) {
  const lines = []
  const today = new Date()
  lines.push("DATA DE HOJE: " + today.toLocaleDateString("pt-BR") + " (" + today.toISOString().slice(0, 10) + ")")

  const rep = reports.slice(0, 10).map((r) => {
    const snippet = (r.analysis || r.summary?.abstract || "").toString().replace(/\s+/g, " ").slice(0, 400)
    const toDo = Array.isArray(r.toDo) && r.toDo.length ? " | A fazer: " + r.toDo.slice(0, 5).join("; ") : ""
    return `- "${r.title || "Relatório"}" (${d2(r.createdAt)}, ${r.status || "?"})${snippet ? ": " + snippet : ""}${toDo}`
  })
  lines.push("\nRELATÓRIOS (" + reports.length + "):\n" + (rep.join("\n") || "nenhum"))

  const ev = events.slice(0, 25).map((e) => `- ${e.title || "Evento"} [${e.type || "?"}] ${String(e.day).padStart(2, "0")}/${(Number(e.month) + 1)}/${e.year} ${e.time || ""}`)
  lines.push("\nEVENTOS/AGENDA (" + events.length + "):\n" + (ev.join("\n") || "nenhum"))

  const tk = tasks.slice(0, 25).map((t) => `- ${t.title || "Tarefa"} [${t.status || "todo"}]${t.assignedName ? " → " + t.assignedName : ""}`)
  lines.push("\nATIVIDADES/TAREFAS (" + tasks.length + "):\n" + (tk.join("\n") || "nenhuma"))

  const nt = notes.slice(0, 15).map((n) => `- ${(n.text || n.title || "").toString().slice(0, 80)}`)
  lines.push("\nNOTAS (" + notes.length + "):\n" + (nt.join("\n") || "nenhuma"))

  return lines.join("\n").slice(0, 9000)
}
