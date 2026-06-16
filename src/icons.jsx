// Conjunto de ícones SVG inline (sem dependências externas).
const S = ({ children, size = 22, stroke = 2, ...p }) => (
  <svg
    width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={stroke}
    strokeLinecap="round" strokeLinejoin="round" {...p}
  >
    {children}
  </svg>
)

export const Mic = (p) => (
  <S {...p}><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0" /><path d="M12 18v3" /></S>
)
export const User = (p) => (
  <S {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></S>
)
export const Grid = (p) => (
  <S {...p} stroke={0} fill="currentColor"><circle cx="6" cy="6" r="1.6"/><circle cx="12" cy="6" r="1.6"/><circle cx="6" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/></S>
)
export const Share = (p) => (
  <S {...p}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></S>
)
export const Search = (p) => (
  <S {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></S>
)
export const Play = (p) => (
  <S {...p} stroke={0} fill="currentColor"><path d="M8 5.5v13l11-6.5z"/></S>
)
export const Pause = (p) => (
  <S {...p} stroke={0} fill="currentColor"><rect x="7" y="5" width="3.4" height="14" rx="1.2"/><rect x="13.6" y="5" width="3.4" height="14" rx="1.2"/></S>
)
export const Check = (p) => (
  <S {...p}><path d="M20 6L9 17l-5-5"/></S>
)
export const X = (p) => (
  <S {...p}><path d="M18 6L6 18M6 6l12 12"/></S>
)
export const Back = (p) => (
  <S {...p}><path d="M15 18l-6-6 6-6"/></S>
)
export const Skip = ({ dir = "back", ...p }) => (
  <S {...p}>
    {dir === "back"
      ? <><path d="M11 8L7 12l4 4"/><path d="M7 12h7a4 4 0 0 1 0 8"/></>
      : <><path d="M13 8l4 4-4 4"/><path d="M17 12h-7a4 4 0 0 0 0 8"/></>}
    <text x="12" y="8" fontSize="6" fill="currentColor" stroke="none" textAnchor="middle">10</text>
  </S>
)
export const Bookmark = ({ filled, ...p }) => (
  <S {...p} fill={filled ? "currentColor" : "none"}><path d="M6 3h12v18l-6-4-6 4z"/></S>
)
export const Chevron = (p) => (
  <S {...p}><path d="M6 9l6 6 6-6"/></S>
)
export const Download = (p) => (
  <S {...p}><path d="M12 3v12"/><path d="M7 11l5 4 5-4"/><path d="M5 21h14"/></S>
)
export const Doc = (p) => (
  <S {...p}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h6"/></S>
)
export const More = (p) => (
  <S {...p} stroke={0} fill="currentColor"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></S>
)
export const Plus = (p) => (
  <S {...p}><path d="M12 5v14M5 12h14"/></S>
)
export const FileText = (p) => (
  <S {...p}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></S>
)
export const Laptop = (p) => (
  <S {...p}><rect x="4" y="5" width="16" height="11" rx="2"/><path d="M2 20h20"/></S>
)
export const MathFn = (p) => (
  <S {...p}><path d="M5 4h6l-6 16h6"/><path d="M14 10l5 6M19 10l-5 6"/></S>
)
export const Bolt = (p) => (
  <S {...p} fill="currentColor" stroke="none"><path d="M13 2L4 14h6l-1 8 9-12h-6z"/></S>
)
export const Book = (p) => (
  <S {...p}><path d="M5 4a2 2 0 0 1 2-2h11v16H7a2 2 0 0 0-2 2z"/><path d="M5 20a2 2 0 0 1 2-2h11"/></S>
)
export const BookOpen = (p) => (
  <S {...p}><path d="M12 6c-1.5-1-4-1.6-6.5-1.6V18C8 18 10.5 18.6 12 19.6"/><path d="M12 6c1.5-1 4-1.6 6.5-1.6V18C16 18 13.5 18.6 12 19.6"/><path d="M12 6v13.6"/></S>
)
export const Clock = (p) => (
  <S {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></S>
)
