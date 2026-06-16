// Waveform decorativo gerado proceduralmente (SVG).
function bars(count, seed = 1) {
  const out = []
  for (let i = 0; i < count; i++) {
    const t = i / count
    const env = Math.sin(t * Math.PI)            // envelope (mais alto no centro)
    const n = Math.abs(Math.sin(i * 12.9898 * seed) * 43758.5453 % 1)
    out.push(0.15 + env * (0.4 + n * 0.6))
  }
  return out
}

export default function Waveform({
  count = 48,
  height = 90,
  color = "var(--accent)",
  played = 0.45,
  playedColor = "var(--accent-deep)",
  seed = 1,
  gap = 3,
}) {
  const data = bars(count, seed)
  const bw = 2.6
  const step = bw + gap
  const width = count * step
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ display: "block" }}>
      {data.map((v, i) => {
        const h = v * height
        const x = i * step
        const isPlayed = i / count < played
        return (
          <rect
            key={i}
            x={x}
            y={(height - h) / 2}
            width={bw}
            height={h}
            rx={bw / 2}
            fill={isPlayed ? playedColor : color}
            opacity={isPlayed ? 0.9 : 0.5}
          />
        )
      })}
    </svg>
  )
}

// Onda fluida e contínua para a tela inicial (estética).
export function FlowWave({ color = "rgba(191,231,236,0.6)" }) {
  return (
    <svg viewBox="0 0 300 70" width="100%" fill="none" stroke={color} strokeWidth="1">
      {[0, 8, 16, 24].map((o, k) => (
        <path
          key={k}
          d={`M0 ${40 - o / 2} C 60 ${10 - o}, 110 ${60 + o}, 160 ${35 - o / 2} S 260 ${15 - o}, 300 ${40 - o / 2}`}
          opacity={0.7 - k * 0.13}
        />
      ))}
    </svg>
  )
}
