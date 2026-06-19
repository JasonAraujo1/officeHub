// Header com fundo de ondas fluidas (gradiente âmbar).
// Usado no topo das telas. `compact` deixa o header mais baixo (telas internas).
export default function WaveHeader({ children, compact = false }) {
  return (
    <div className={`wave-header${compact ? " compact" : ""}`}>
      <div className="wave-content">{children}</div>
    </div>
  )
}
