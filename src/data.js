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
