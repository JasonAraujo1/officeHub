import { jsPDF } from "jspdf"

// Paleta: preto + âmbar (amarelo levemente avermelhado), alinhada ao app.
const DARK = [17, 17, 17]
const AMBER = [194, 120, 12] // #C2780C
const GRAY = [90, 90, 90]
const TEXT = [38, 38, 38]

// Gera e baixa um PDF do "Relatório Completo": análise do diálogo,
// o que foi pedido, o que foi feito e o que se quer que seja feito.
// Header e footer estilizados repetidos em todas as páginas. Sem transcrição.
export function generateReportPdf(report = {}) {
  const r = report
  const summary = r.summary || {}

  const doc = new jsPDF({ unit: "pt", format: "a4" })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()

  const margin = 48
  const maxW = pageW - margin * 2
  const headerH = 72
  const footerH = 40
  const contentTop = headerH + 28
  const contentBottom = pageH - footerH - 12
  let y = contentTop

  const ensure = (h) => {
    if (y + h > contentBottom) {
      doc.addPage()
      y = contentTop
    }
  }

  const sectionTitle = (text) => {
    ensure(34)
    // marcador âmbar + título
    doc.setFillColor(...AMBER)
    doc.rect(margin, y - 9, 4, 14, "F")
    doc.setFont("helvetica", "bold")
    doc.setFontSize(13)
    doc.setTextColor(...DARK)
    doc.text(text.toUpperCase(), margin + 12, y + 2)
    y += 14
    // linha fina abaixo
    doc.setDrawColor(225, 225, 225)
    doc.setLineWidth(0.7)
    doc.line(margin, y, pageW - margin, y)
    y += 16
  }

  const paragraph = (text, size = 10.5, gap = 8) => {
    if (!text) return
    doc.setFont("helvetica", "normal")
    doc.setFontSize(size)
    doc.setTextColor(...TEXT)
    const lines = doc.splitTextToSize(String(text), maxW)
    const lineH = size * 1.45
    for (const line of lines) {
      ensure(lineH)
      doc.text(line, margin, y)
      y += lineH
    }
    y += gap
  }

  const list = (items, size = 10.5) => {
    if (!items?.length) return
    doc.setFontSize(size)
    const lineH = size * 1.45
    items.forEach((it) => {
      const lines = doc.splitTextToSize(String(it), maxW - 18)
      lines.forEach((line, i) => {
        ensure(lineH)
        if (i === 0) {
          doc.setFillColor(...AMBER)
          doc.circle(margin + 3, y - 3, 2, "F")
        }
        doc.setFont("helvetica", "normal")
        doc.setTextColor(...TEXT)
        doc.text(line, margin + 16, y)
        y += lineH
      })
      y += 4
    })
    y += 4
  }

  const emptyNote = (text) => {
    doc.setFont("helvetica", "italic")
    doc.setFontSize(10)
    doc.setTextColor(...GRAY)
    ensure(16)
    doc.text(text, margin, y)
    y += 18
  }

  // ---------- Conteúdo ----------
  // Título do relatório
  doc.setFont("helvetica", "bold")
  doc.setFontSize(17)
  doc.setTextColor(...DARK)
  doc.splitTextToSize(r.title || "Relatório", maxW).forEach((l) => {
    ensure(22)
    doc.text(l, margin, y)
    y += 22
  })
  // Meta
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9.5)
  doc.setTextColor(...GRAY)
  const dur = r.durationSec ? `${Math.round(r.durationSec / 60)} min` : "—"
  const spk = r.speakers || "—"
  ensure(16)
  doc.text(`Duração: ${dur}     •     Interlocutores: ${spk}`, margin, y)
  y += 22

  // Resumo executivo
  if (summary.abstract) {
    sectionTitle("Resumo")
    paragraph(summary.abstract)
  }

  // Análise do diálogo
  sectionTitle("Análise do Diálogo")
  if (r.analysis || r.fullReport) paragraph(r.analysis || r.fullReport)
  else emptyNote("Análise indisponível.")

  // O que foi pedido
  sectionTitle("O que foi pedido")
  if (r.requested?.length) list(r.requested)
  else emptyNote("Nenhuma solicitação identificada.")

  // O que foi feito
  sectionTitle("O que foi feito")
  if (r.done?.length) list(r.done)
  else emptyNote("Nenhuma realização identificada.")

  // O que se quer que seja feito
  sectionTitle("O que se quer que seja feito")
  if (r.toDo?.length) list(r.toDo)
  else if (summary.actions?.length) list(summary.actions)
  else emptyNote("Nenhum próximo passo identificado.")

  // ---------- Header + Footer em todas as páginas ----------
  const today = new Date().toLocaleDateString("pt-BR")
  const total = doc.getNumberOfPages()
  for (let p = 1; p <= total; p++) {
    doc.setPage(p)

    // Header: faixa preta + acento âmbar
    doc.setFillColor(...DARK)
    doc.rect(0, 0, pageW, headerH, "F")
    doc.setFillColor(...AMBER)
    doc.rect(0, headerH, pageW, 3, "F")
    doc.setFont("helvetica", "bold")
    doc.setFontSize(15)
    doc.setTextColor(255, 255, 255)
    doc.text("controllerHub", margin, 38)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9.5)
    doc.setTextColor(...AMBER)
    doc.text("RELATÓRIO DE ANÁLISE", margin, 54)
    doc.setTextColor(190, 190, 190)
    doc.setFontSize(9)
    doc.text(today, pageW - margin, 38, { align: "right" })

    // Footer: linha âmbar + textos
    doc.setDrawColor(...AMBER)
    doc.setLineWidth(0.8)
    doc.line(margin, pageH - footerH, pageW - margin, pageH - footerH)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8.5)
    doc.setTextColor(...GRAY)
    doc.text("controllerHub · Relatório gerado por IA", margin, pageH - footerH + 16)
    doc.text(`Página ${p} de ${total}`, pageW - margin, pageH - footerH + 16, { align: "right" })
  }

  const safe = (r.title || "relatorio").replace(/[^\w\-]+/g, "_").slice(0, 60)
  doc.save(`${safe}.pdf`)
}
