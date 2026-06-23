// Utilitário de cor para manter o padrão de aba colorida do app:
//  - letra/ícone PRETO se a cor de fundo for clara, BRANCO se for escura
//  - elementos com fundo translúcido fosco
//  - ícones sempre na cor da letra (use o retorno de textOn)
// Reutilizável em qualquer aba. Veja DESIGN_COLORS.md.

function parse(hex) {
  const h = (hex || "#000").replace("#", "")
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h
  return {
    r: parseInt(n.slice(0, 2), 16) || 0,
    g: parseInt(n.slice(2, 4), 16) || 0,
    b: parseInt(n.slice(4, 6), 16) || 0,
  }
}
const toHex = (r, g, b) => "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("")

// Luminância perceptual → decide preto ou branco para máximo contraste.
export function textOn(hex) {
  const { r, g, b } = parse(hex)
  const lum = 0.299 * r + 0.587 * g + 0.114 * b
  return lum > 150 ? "#000000" : "#ffffff"
}

// Escurece a cor (mistura com preto) — ex.: faixa de resumo "da cor, porém mais escura".
export function darken(hex, amount = 0.4) {
  const { r, g, b } = parse(hex)
  const f = 1 - amount
  return toHex(r * f, g * f, b * f)
}

// Fundo fosco translúcido sobre a cor da aba (branco se a aba é escura, preto se clara).
export function frost(hex, alpha = 0.18) {
  return textOn(hex) === "#000000"
    ? `rgba(255,255,255,${alpha})`
    : `rgba(0,0,0,${alpha})`
}

// Pares CLARO/ESCURO (mesma matiz) das 6 cores funcionais — claro p/ fundo,
// escuro saturado p/ elementos (faixas/barras), como no padrão do print.
export const FN_COLORS = {
  home:     { light: "#c8f7bd", dark: "#4fae6b" }, // verde
  record:   { light: "#ffe9a8", dark: "#e0a92e" }, // amarelo
  reports:  { light: "#ffd4b5", dark: "#e3824a" }, // coral
  calendar: { light: "#e9d4fb", dark: "#a86fd4" }, // lilás
  tools:    { light: "#cfe2fe", dark: "#5b8fe0" }, // azul
  account:  { light: "#ffd0f0", dark: "#d978bf" }, // rosa
}
