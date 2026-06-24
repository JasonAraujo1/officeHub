import { useEffect, useState } from "react"
import { Back, Plus, X } from "../icons.jsx"
import { subscribeNotes, createNote, deleteNote } from "../lib/notes.js"

export default function Notes({ go }) {
  const [list, setList] = useState([])
  const [text, setText] = useState("")

  useEffect(() => {
    let unsub
    try { unsub = subscribeNotes(setList) } catch (e) { console.error(e) }
    return () => unsub && unsub()
  }, [])

  async function add() {
    const t = text.trim()
    if (!t) return
    try { await createNote(t); setText("") }
    catch (e) { console.error(e); alert("Não foi possível salvar a nota.") }
  }

  return (
    <div className="screen fn-sub-screen notes-screen">
      <div className="topbar">
        <button className="round-btn" onClick={() => go("widgets")} aria-label="Voltar"><Back size={20} /></button>
        <div className="title center">Notas</div>
        <span style={{ width: 44 }} />
      </div>

      <div className="invite-row" style={{ marginBottom: 14 }}>
        <input className="rec-title-input" value={text} placeholder="Escreva uma nota…"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") add() }} />
        <button className="pill" style={{ borderRadius: 14 }} onClick={add} aria-label="Adicionar nota"><Plus size={18} /></button>
      </div>

      {list.length === 0 ? (
        <p className="rec-status-msg" style={{ margin: "20px auto" }}>Nenhuma nota ainda.</p>
      ) : (
        <div className="recent-list">
          {list.map((n) => (
            <div className="list-card" key={n.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: 14 }}>
              <span style={{ flex: 1, whiteSpace: "pre-wrap", fontSize: 14 }}>{n.text}</span>
              <button className="notif-del" onClick={() => deleteNote(n.id)} aria-label="Excluir"><X size={15} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
