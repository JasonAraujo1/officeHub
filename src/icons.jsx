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

export const Home = (p) => (
  <S {...p}><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></S>
)
export const Calendar = (p) => (
  <S {...p}><rect x="3" y="4.5" width="18" height="16" rx="3"/><path d="M3 9h18"/><path d="M8 2.5v4M16 2.5v4"/></S>
)
export const Activity = (p) => (
  <S {...p}><path d="M3 12h4l2.5-7 5 14L17 12h4"/></S>
)
export const Chart = (p) => (
  <S {...p}><path d="M3 3v18h18"/><rect x="7" y="11" width="3" height="6" rx="1"/><rect x="12" y="7" width="3" height="10" rx="1"/><rect x="17" y="13" width="3" height="4" rx="1"/></S>
)
export const Trash = (p) => (
  <S {...p}><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></S>
)
export const Menu = (p) => (
  <S {...p}><path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/></S>
)
export const Bell = (p) => (
  <S {...p}><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 20a2 2 0 0 0 4 0"/></S>
)
export const Sparkle = (p) => (
  <S {...p} fill="currentColor" stroke="none"><path d="M12 2l2.2 6.2L20 10l-5.8 1.8L12 18l-2.2-6.2L4 10l5.8-1.8z"/></S>
)

export const Paperclip = (p) => (
  <S {...p}><path d="M21 11.5l-8.5 8.5a5 5 0 0 1-7-7l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7l-8.5 8.5a1.6 1.6 0 0 1-2.3-2.3l7.8-7.8"/></S>
)

export const FileSolid = (p) => (
  <S {...p} stroke="none" fill="currentColor"><path d="M6 2h7.2L19 7.8V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/><path d="M13 2.4V8h5.4" fill="rgba(255,255,255,.55)"/></S>
)
export const CalendarSolid = (p) => (
  <S {...p} stroke="none" fill="currentColor"><rect x="3.2" y="5" width="17.6" height="16" rx="3.5"/><rect x="7" y="2.4" width="2.4" height="4.2" rx="1.2"/><rect x="14.6" y="2.4" width="2.4" height="4.2" rx="1.2"/><rect x="6.4" y="11" width="11.2" height="2" rx="1" fill="#fff"/></S>
)

export const MicSolid = (p) => (
  <S {...p} stroke="none" fill="currentColor"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0h-2a5 5 0 0 1-10 0z"/><rect x="11" y="18.5" width="2" height="3" rx="1"/><rect x="8.5" y="21" width="7" height="2" rx="1"/></S>
)

export const Pencil = (p) => (
  <S {...p}><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></S>
)

export const ChevronLeft = (p) => (<S {...p}><path d="M15 18l-6-6 6-6"/></S>)
export const ChevronRight = (p) => (<S {...p}><path d="M9 18l6-6-6-6"/></S>)

export const Gear = (p) => (
  <S {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></S>
)
export const Shield = (p) => (
  <S {...p} stroke="none" fill="currentColor"><path d="M12 2l8 3v6c0 5-3.4 8.5-8 11-4.6-2.5-8-6-8-11V5z"/></S>
)
export const LogOut = (p) => (
  <S {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></S>
)

export const Help = (p) => (
  <S {...p}><circle cx="12" cy="12" r="9"/><path d="M9.2 9.2a2.8 2.8 0 0 1 5.4 1c0 1.8-2.6 2.2-2.6 4"/><path d="M12 17.5h.01"/></S>
)
export const Mail = (p) => (
  <S {...p}><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M4 7l8 6 8-6"/></S>
)
export const Chat = (p) => (
  <S {...p}><path d="M21 11.5a8.5 8.5 0 0 1-12.3 7.6L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5z"/></S>
)

export const UserPlus = (p) => (<S {...p}><circle cx="9" cy="8" r="4"/><path d="M3 21a6 6 0 0 1 12 0"/><path d="M19 8v6M22 11h-6"/></S>)
export const Users = (p) => (<S {...p}><circle cx="9" cy="8" r="3.5"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8"/><path d="M21.5 20a6 6 0 0 0-5-5.9"/></S>)
