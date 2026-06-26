import { useEffect, useState } from "react"
import { Back, Check, X, Plus, Calendar, Trash } from "../icons.jsx"
import { updateNote, deleteNote } from "../lib/notes.js"
import { subscribeEvents } from "../lib/events.js"

export default function NoteDetail({ go, item }) {
  const note = item || {}
  const id = note.id
  const [title, setTitle] = useState(note.title || "")
  const [text, setText] = useState(note.text || "")
  const [kind, setKind] = useState(note.kind || "note")
  const [items, setItems] = useState(Array.isArray(note.items) ? note.items : [])
  const [eventId, setEventId] = useState(note.eventId || "")
  const [eventTitle, setEventTitle] = useState(note.eventTitle || "")
  const [newItem, setNewItem] = useState("")
  const [events, setEvents] = useState([])
  const [pickEvent, setPickEvent] = useState(false)
  const [savedAt, setSavedAt] = useState(0)

  useEffect(() => {
    let unsub
    try { unsub = subscribeEvents(setEvents) } catch (e) {}
    return () => unsub && unsub()
  }, [])

  async function persist(patch) {
    if (!id) return
    try { await updateNote(id, patch); setSavedAt(Date.now()) } catch (e) { console.error(e) }
  }

  function setKindBoth(k) { setKind(k); persist({ kind: k }) }

  function toggleItem(i) {
    const next = items.map((it, idx) => idx === i ? { ...it, done: !it.done } : it)
    setItems(next); persist({ items: next })
  }
  function addItem() {
    const t = newItem.trim(); if (!t) return
    const next = [...items, { text: t, done: false }]
    setItems(next); setNewItem(""); persist({ items: next })
  }
  function removeItem(i) {
    const next = items.filter((_, idx) => idx !== i)
    setItems(next); persist({ items: next })
  }

  function linkEvent(ev) {
    setEventId(ev.id); setEventTitle(ev.title); setPickEvent(false)
    persist({ eventId: ev.id, eventTitle: ev.title })
  }
  function unlinkEvent() {
    setEventId(""); setEventTitle(""); persist({ eventId: "", eventTitle: "" })
  }

  async function remove() {
    if (!confirm("Excluir esta nota?")) return
    try { await deleteNote(id); go("notes") } catch (e) { console.error(e) }
  }

  return (
    <div className="screen fn-sub-screen note-detail-screen">
      <div className="topbar">
        <button className="round-btn" onClick={() => { persist({ title, text }); go("notes") }} aria-label="Voltar"><Back size={20} /></button>
        <div className="title center">Nota</div>
        <button className="round-btn subtle" onClick={remove} aria-label="Excluir"><Trash size={18} /></button>
      </div>

      <input className="note-title-input" value={title} placeholder="Título"
        onChange={(e) => setTitle(e.target.value)} onBlur={() => persist({ title })} />

      <div className="rpt-tabs" style={{ marginTop: 6 }}>
        <button className={kind === "note" ? "active" : ""} onClick={() => setKindBoth("note")}>Nota</button>
        <button className={kind === "checklist" ? "active" : ""} onClick={() => setKindBoth("checklist")}>Checklist</button>
      </div>

      {kind === "note" ? (
        <textarea className="note-text-input" value={text} placeholder="Escreva aqui…"
          onChange={(e) => setText(e.target.value)} onBlur={() => persist({ text })} rows={10} />
      ) : (
        <div className="note-check">
          {items.map((it, i) => (
            <div className="note-check-row" key={i}>
              <button className={`note-check-box${it.done ? " on" : ""}`} onClick={() => toggleItem(i)} aria-label="Concluir">
                {it.done && <Check size={13} />}
              </button>
              <span className={`note-check-text${it.done ? " done" : ""}`}>{it.text}</span>
              <button className="note-check-del" onClick={() => removeItem(i)} aria-label="Remover"><X size={14} /></button>
            </div>
          ))}
          <div className="invite-row" style={{ marginTop: 8 }}>
            <input className="rec-title-input" value={newItem} placeholder="Novo item…"
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addItem() }} />
            <button className="pill" style={{ borderRadius: 14 }} onClick={addItem} aria-label="Adicionar item"><Plus size={18} /></button>
          </div>
        </div>
      )}

      {/* vínculo com evento */}
      <div className="settings-section">Evento vinculado</div>
      {eventTitle ? (
        <div className="list-card" style={{ display: "flex", alignItems: "center", gap: 10, padding: 14 }}>
          <span className="row-ic"><Calendar size={18} /></span>
          <span className="row-label" style={{ flex: 1 }}>{eventTitle}</span>
          <button className="note-check-del" onClick={unlinkEvent} aria-label="Desvincular"><X size={15} /></button>
        </div>
      ) : (
        <>
          <button className="pill ghost" style={{ borderRadius: 14 }} onClick={() => setPickEvent((v) => !v)}>
            <Calendar size={17} /> Vincular a um evento
          </button>
          {pickEvent && (
            <div className="list-card" style={{ marginTop: 8, padding: 6 }}>
              {events.length === 0 ? (
                <div className="row-item static"><span className="row-label sub">Nenhum evento na agenda.</span></div>
              ) : events.slice(0, 30).map((ev) => (
                <button className="row-item" key={ev.id} onClick={() => linkEvent(ev)}>
                  <span className="row-ic"><Calendar size={16} /></span>
                  <span className="row-label">{ev.title}<br /><span className="row-label sub">{String(ev.day).padStart(2, "0")}/{Number(ev.month) + 1}/{ev.year} {ev.time || ""}</span></span>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      <p className="rec-status-msg" style={{ margin: "16px auto 24px", fontSize: 12 }}>
        {savedAt ? "Salvo automaticamente" : "As alterações são salvas automaticamente"}
      </p>
    </div>
  )
}
