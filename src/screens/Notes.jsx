import { useEffect, useState } from "react"
import { Back, Plus, Check, Calendar } from "../icons.jsx"
import { subscribeNotes, createNote } from "../lib/notes.js"

function preview(n) {
  if (n.kind === "checklist") {
    const total = (n.items || []).length
    const done = (n.items || []).filter((i) => i.done).length
    return { hint: `checklist · ${done}/${total}`, body: (n.items || []).slice(0, 3).map((i) => i.text).join(" · ") }
  }
  return { hint: n.eventTitle ? "evento" : "nota", body: n.text || "" }
}

export default function Notes({ go }) {
  const [list, setList] = useState([])
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let unsub
    try { unsub = subscribeNotes(setList) } catch (e) { console.error(e) }
    return () => unsub && unsub()
  }, [])

  async function addNew() {
    if (busy) return
    setBusy(true)
    try {
      const id = await createNote({ title: "", text: "", kind: "note", items: [] })
      go("note", { id, title: "", text: "", kind: "note", items: [], eventId: "", eventTitle: "" })
    } catch (e) { console.error(e); alert("Não foi possível criar a nota.") }
    finally { setBusy(false) }
  }

  return (
    <div className="screen fn-sub-screen notes-screen">
      <div className="topbar">
        <button className="round-btn" onClick={() => go("widgets")} aria-label="Voltar"><Back size={20} /></button>
        <div className="title center">Notas</div>
        <button className="round-btn subtle" onClick={addNew} aria-label="Nova nota"><Plus size={20} /></button>
      </div>

      <div className="note-grid">
        <button className="note-card add" onClick={addNew}>
          <Plus size={26} />
          <span>Nova nota</span>
        </button>

        {list.map((n) => {
          const { hint, body } = preview(n)
          return (
            <button className="note-card" key={n.id} onClick={() => go("note", n)}>
              <div className="note-card-top">
                <span className="note-card-kind">
                  {n.kind === "checklist" ? <Check size={13} /> : n.eventTitle ? <Calendar size={13} /> : null}
                  {hint}
                </span>
              </div>
              <div className="note-card-title">{n.title || (body ? "" : "Sem título")}</div>
              <div className="note-card-body">{body}</div>
              {n.eventTitle && <div className="note-card-evt"><Calendar size={12} /> {n.eventTitle}</div>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
