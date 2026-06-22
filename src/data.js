// Dados fictícios usados apenas para montar a interface.

export const subjects = [
  { name: "Ciência da Computação", notes: 1, icon: "laptop", tile: "amber" },
  { name: "Matemática", notes: 1, icon: "math", tile: "rose" },
  { name: "Física", notes: 0, icon: "bolt", tile: "blue" },
  { name: "Literatura", notes: 0, icon: "book", tile: "green" },
]

export const recents = [
  { subject: "Matemática", date: "10 Jan", time: "14:00", dur: "45 min" },
  { subject: "Ciência da Computação", date: "11 Jan", time: "10:00", dur: "60 min" },
  { subject: "Física", date: "12 Jan", time: "16:30", dur: "30 min" },
]

export const transcript = [
  { ts: "00:00:15", who: "Locutor 1", cls: "", text: "Bom dia a todos, vamos começar nossa reunião de alinhamento." },
  { ts: "00:00:45", who: "Locutor 2", cls: "s2", text: "Ótimo! Primeiro, vamos revisar os resultados da última campanha." },
  { ts: "00:01:20", who: "Locutor 1", cls: "", text: "Houve um aumento de 15% no engajamento nas redes sociais." },
  { ts: "00:01:45", who: "Locutor 3", cls: "s3", text: "Devemos investir mais em vídeos curtos e parcerias com influenciadores." },
  { ts: "00:02:30", who: "Locutor 2", cls: "s2", text: "Concordo. Podemos definir um orçamento para o próximo trimestre." },
]

// Lista de relatórios de áudios já analisados.
export const reports = [
  { id: 1, title: "Reunião de alinhamento", date: "10 Nov 2024", duration: "06:42" },
  { id: 2, title: "Entrevista com cliente", date: "08 Nov 2024", duration: "12:18" },
  { id: 3, title: "Ideias do projeto", date: "07 Nov 2024", duration: "04:21" },
]

export const report = {
  title: "Resumo do Áudio",
  duration: "06:42",
  date: "10 Nov 2024",
  summary:
    "Reunião de alinhamento sobre os resultados da campanha, estratégias de conteúdo e próximos passos.",
  topics: [
    "Resultados da campanha",
    "Aumento de 15% no engajamento",
    "Estratégias de conteúdo",
    "Próximos passos",
  ],
  actions: ["Investir em vídeos curtos", "Parcerias com influenciadores"],
}

export const attachments = [
  { name: "reuniao_alinhamento.mp3", date: "10 Nov 2024", time: "09:15", dur: "06:42", seed: 1 },
  { name: "entrevista_cliente.wav", date: "08 Nov 2024", time: "14:30", dur: "12:18", seed: 2 },
  { name: "ideias_projeto.m4a", date: "07 Nov 2024", time: "11:05", dur: "04:21", seed: 3 },
  { name: "feedback_equipe.mp3", date: "05 Nov 2024", time: "16:40", dur: "07:33", seed: 4 },
]

// ---------------------------------------------------------------
// Eventos / Calendário (dados fictícios para a interface)
// ---------------------------------------------------------------
export const eventCategories = {
  reuniao:    { label: "Reuniões",    plural: "Reuniões",    sub: "Agendadas",   color: "var(--c-yellow)" },
  feriado:    { label: "Feriados",    plural: "Feriados",    sub: "Esse mês",    color: "var(--c-blue)" },
  vencimento: { label: "Vencimentos", plural: "Vencimentos", sub: "De contratos", color: "var(--c-green)" },
}

// Mês de referência da interface: junho/2026
export const calRef = { year: 2026, month: 5 } // month 0-indexed (5 = junho)

// 15 reuniões + 3 feriados + 12 vencimentos = 30 eventos
export const events = [
  // Reuniões (15)
  { id: "r1", day: 2, type: "reuniao", title: "Alinhamento semanal", time: "09:00" },
  { id: "r2", day: 3, type: "reuniao", title: "1:1 com gestor", time: "11:30" },
  { id: "r3", day: 4, type: "reuniao", title: "Revisão de campanha", time: "14:00" },
  { id: "r4", day: 5, type: "reuniao", title: "Planejamento de sprint", time: "10:00" },
  { id: "r5", day: 8, type: "reuniao", title: "Reunião com cliente", time: "16:00" },
  { id: "r6", day: 9, type: "reuniao", title: "Daily do time", time: "09:15" },
  { id: "r7", day: 10, type: "reuniao", title: "Apresentação de resultados", time: "15:00" },
  { id: "r8", day: 11, type: "reuniao", title: "Entrevista candidato", time: "13:00" },
  { id: "r9", day: 12, type: "reuniao", title: "Comitê de produto", time: "10:30" },
  { id: "r10", day: 16, type: "reuniao", title: "Retrospectiva", time: "17:00" },
  { id: "r11", day: 17, type: "reuniao", title: "Alinhamento financeiro", time: "11:00" },
  { id: "r12", day: 18, type: "reuniao", title: "Kickoff de projeto", time: "14:30" },
  { id: "r13", day: 19, type: "reuniao", title: "Reunião de diretoria", time: "09:30" },
  { id: "r14", day: 23, type: "reuniao", title: "Review com stakeholders", time: "15:30" },
  { id: "r15", day: 25, type: "reuniao", title: "Planejamento mensal", time: "10:00" },

  // Feriados (3)
  { id: "f1", day: 11, type: "feriado", title: "Corpus Christi", time: "Dia todo" },
  { id: "f2", day: 24, type: "feriado", title: "São João", time: "Dia todo" },
  { id: "f3", day: 29, type: "feriado", title: "São Pedro", time: "Dia todo" },

  // Vencimentos (12)
  { id: "v1", day: 5, type: "vencimento", title: "Contrato fornecedor A", time: "Vence hoje" },
  { id: "v2", day: 7, type: "vencimento", title: "Licença de software", time: "Vence" },
  { id: "v3", day: 10, type: "vencimento", title: "Aluguel do escritório", time: "Vence" },
  { id: "v4", day: 12, type: "vencimento", title: "Contrato cliente B", time: "Renovação" },
  { id: "v5", day: 15, type: "vencimento", title: "Fatura de energia", time: "Vence" },
  { id: "v6", day: 17, type: "vencimento", title: "Plano de saúde", time: "Vence" },
  { id: "v7", day: 19, type: "vencimento", title: "Contrato fornecedor C", time: "Vence hoje" },
  { id: "v8", day: 20, type: "vencimento", title: "Assinatura anual", time: "Renovação" },
  { id: "v9", day: 22, type: "vencimento", title: "Seguro empresarial", time: "Vence" },
  { id: "v10", day: 26, type: "vencimento", title: "Contrato manutenção", time: "Vence" },
  { id: "v11", day: 27, type: "vencimento", title: "Internet corporativa", time: "Vence" },
  { id: "v12", day: 30, type: "vencimento", title: "Contrato fornecedor D", time: "Vence" },
]
