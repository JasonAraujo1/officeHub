import { useEffect, useRef, useState } from "react"
import { X, Check, Calendar } from "../icons.jsx"
import { callChat, buildAppContext } from "../lib/ai.js"
import { subscribeProfile } from "../lib/team.js"
import { subscribeReports } from "../lib/reports.js"
import { subscribeEvents, createEvent } from "../lib/events.js"
import { subscribeTasks } from "../lib/tasks.js"
import { subscribeNotes } from "../lib/notes.js"
import { auth } from "../firebase.js"
import gifTalk from "../assets/logo.gif"
import imgIdle from "../assets/AI.png"
import fabIcon from "../assets/AI.png"

const GREETING = "Olá! Sou a IA do Controlaí. Posso responder sobre seus relatórios, agenda e atividades, sugerir reuniões e pautas, e marcar eventos. Como posso ajudar?"
const TIPOS = ["tarefa", "lembrete", "reuniao", "vencimento", "feriado"]

function parseEvent(text) {
  const m = text.match(/\[\[EVENTO\]\]([\s\S]*?)\[\[\/EVENTO\]\]/)
  if (!m) return { clean: text, event: null }
  const clean = text.replace(m[0], "").trim()
  try {
    const o = JSON.parse(m[1].trim())
    const d = new Date((o.date || "") + "T00:00:00")
    if (isNaN(d)) return { clean, event: null }
    return { clean, event: {
      title: (o.title || "Evento").toString().slice(0, 120),
      type: TIPOS.includes(o.type) ? o.type : "reuniao",
      day: d.getDate(), month: d.getMonth(), year: d.getFullYear(),
      time: (o.time || "—").toString().slice(0, 10),
    } }
  } catch { return { clean, event: null } }
}

export default function AIFloating({ go, hidden }) {
  const [open, setOpen] = useState(false)
  const [profile, setProfile] = useState(null)
  const [reports, setReports] = useState([])
  const [events, setEvents] = useState([])
  const [tasks, setTasks] = useState([])
  const [notes, setNotes] = useState([])
  const [messages, setMessages] = useState([{ role: "assistant", content: GREETING }])
  const [input, setInput] = useState("")
  const [thinking, setThinking] = useState(false)
  const scrollRef = useRef(null)

  // assina os dados só quando o modal está aberto
  useEffect(() => {
    if (!open) return
    const subs = []
    try { subs.push(subscribeProfile(setProfile)) } catch (e) {}
    try { subs.push(subscribeReports(setReports)) } catch (e) {}
    try { subs.push(subscribeEvents(setEvents)) } catch (e) {}
    try { subs.push(subscribeTasks(setTasks)) } catch (e) {}
    try { subs.push(subscribeNotes(setNotes)) } catch (e) {}
    return () => subs.forEach((u) => u && u())
  }, [open])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, thinking, open])

  const done = !!profile?.aiSurveyDone

  async function send() {
    const text = input.trim()
    if (!text || thinking) return
    const next = [...messages, { role: "user", content: text }]
    setMessages(next); setInput(""); setThinking(true)
    try {
      const ctx = buildAppContext({ reports, events, tasks, notes })
      const reply = await callChat(next.filter((m) => m.role !== "system").map((m) => ({ role: m.role, content: m.content })), profile?.aiSurvey || {}, ctx)
      const { clean, event } = parseEvent(reply || "")
      setMessages((m) => [...m, { role: "assistant", content: clean || "Não consegui responder agora.", event, eventAdded: false }])
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: "Tive um problema para responder. Tente novamente." }])
    } finally { setThinking(false) }
  }

  async function addEvent(idx) {
    const ev = messages[idx]?.event
    if (!ev) return
    try {
      const u = auth?.currentUser
      await createEvent({ ...ev, taggedUids: u ? [u.uid] : [], taggedNames: u ? ["Eu mesmo"] : [] })
      setMessages((m) => m.map((msg, i) => i === idx ? { ...msg, eventAdded: true } : msg))
    } catch (e) { alert("Não foi possível adicionar o evento.") }
  }

  if (hidden) return null

  return (
    <>
      {!open && (
        <button className="fab-ai with-nav" onClick={() => setOpen(true)} aria-label="IA do Controlaí">
          <img src={fabIcon} alt="" />
        </button>
      )}

      {open && (
        <div className="ai-modal-overlay" onClick={() => setOpen(false)}>
          <div className="ai-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ai-modal-head">
              <img className="ai-head-img" src={thinking ? gifTalk : imgIdle} alt="" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="ai-head-name">IA do Controlaí</div>
                <div className="ai-head-status">{thinking ? "digitando…" : "gestão ágil"}</div>
              </div>
              <button className="round-btn subtle" onClick={() => setOpen(false)} aria-label="Fechar"><X size={18} /></button>
            </div>

            {profile && !done ? (
              <div className="ai-modal-gate">
                <img src={imgIdle} alt="" style={{ width: 72, height: 72, borderRadius: 18 }} />
                <p>Para liberar a conversa, responda o questionário rápido (10 perguntas).</p>
                <button className="pill" style={{ borderRadius: 14 }} onClick={() => { setOpen(false); go("ai") }}>Configurar IA</button>
              </div>
            ) : (
              <>
                <div className="ai-msgs" ref={scrollRef}>
                  {messages.map((m, i) => (
                    <div key={i} className={`ai-row ${m.role}`}>
                      {m.role === "assistant" && <img src={(thinking && i === messages.length - 1) ? gifTalk : imgIdle} alt="" className="ai-av" />}
                      <div className="ai-col">
                        <div className={`ai-bubble ${m.role}`}>{m.content}</div>
                        {m.event && (
                          <div className="ai-event">
                            <div className="ai-event-info">
                              <Calendar size={16} />
                              <span><strong>{m.event.title}</strong><br />{String(m.event.day).padStart(2, "0")}/{m.event.month + 1}/{m.event.year} · {m.event.time} · {m.event.type}</span>
                            </div>
                            {m.eventAdded
                              ? <span className="ai-event-done"><Check size={14} /> Adicionado</span>
                              : <button className="ai-event-add" onClick={() => addEvent(i)}>Adicionar ao calendário</button>}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {thinking && (
                    <div className="ai-row assistant">
                      <img src={gifTalk} alt="" className="ai-av" />
                      <div className="ai-bubble assistant ai-typing"><span /><span /><span /></div>
                    </div>
                  )}
                </div>

                <div className="ai-input">
                  <textarea value={input} onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send() } }}
                    placeholder="Pergunte sobre relatórios, agenda…" rows={1} />
                  <button className="ai-send" onClick={send} disabled={thinking || !input.trim()} aria-label="Enviar">➤</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
