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

// Chama a Cloud Function de chat (Groq via callable). Envia o histórico e o questionário.
export async function callChat(messages, survey) {
  if (!functions) throw new Error("Funções indisponíveis")
  const fn = httpsCallable(functions, "chatAgile")
  const res = await fn({ messages, survey })
  return res.data?.reply || ""
}
