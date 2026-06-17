// Header com fundo de ondas fluidas (gradiente âmbar).
// Usado no topo das telas. `compact` deixa o header mais baixo (telas internas).
export default function WaveHeader({ children, compact = false }) {
  return (
    <div className={`wave-header${compact ? " compact" : ""}`}>
      <svg className="wave-bg" viewBox="0 0 430 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="430" height="240" fill="#111111" />
        <path d="M-20 70 C 90 20, 150 130, 280 80 S 460 60, 470 110 L 470 -20 -20 -20 Z"
              fill="#ffffff" opacity="0.06" />
        <path d="M-20 130 C 80 90, 170 180, 260 130 S 430 110, 470 160 L 470 260 -20 260 Z"
              fill="#000000" opacity="0.30" />
        <path d="M-20 175 C 110 135, 180 215, 300 175 S 440 165, 470 200 L 470 260 -20 260 Z"
              fill="#ffffff" opacity="0.05" />
        <path d="M-20 205 C 90 185, 200 235, 470 205 L 470 260 -20 260 Z"
              fill="#000000" opacity="0.25" />
      </svg>
      <div className="wave-content">{children}</div>
    </div>
  )
}
