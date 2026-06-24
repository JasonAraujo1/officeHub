import { useEffect, useRef, useState } from "react"
import { Back, Check, Calendar } from "../icons.jsx"
import { SURVEY, saveSurvey, callChat, buildAppContext } from "../lib/ai.js"
import { subscribeProfile } from "../lib/team.js"
import { subscribeReports } from "../lib/reports.js"
import { subscribeEvents, createEvent } from "../lib/events.js"
import { subscribeTasks } from "../lib/tasks.js"
import { subscribeNotes } from "../lib/notes.js"
import { auth } from "../firebase.js"
import gifTalk from "../assets/logo.gif"
import imgIdle from "../assets/logo.png"

const GREETING = "Olá! Sou a IA do Controlaí, sua assistente de gestão ágil. Já conheço o perfil da sua equipe e tenho acesso aos seus relatórios, agenda e atividades. Posso responder dúvidas sobre o que já foi feito, sugerir reuniões, pautas e relatórios — e até marcar eventos no seu calendário. Como posso ajudar?"

const TIPOS = ["tarefa", "lembrete", "reuniao", "vencimento", "feriado"]

// Extrai um bloco [[EVENTO]]{...}[[/EVENTO]] do texto, se houver.
function parseEvent(text) {
  const m = text.match(/\[\[EVENTO\]\]([\s\S]*?)\[\[\/EVENTO\]\]/)
  if (!m) return { clean: text, event: null }
  const clean = text.replace(m[0], "").trim()
  try {
    const o = JSON.parse(m[1].trim())
    const d = new Date((o.date || "") + "T00:00:00")
    if (isNaN(d)) return { clean, event: null }
    const ev = {
      title: (o.title || "Evento").toString().slice(0, 120),
      type: TIPOS.includes(o.type) ? o.type : "reuniao",
      day: d.getDate(), month: d.getMonth(), year: d.getFullYear(),
      time: (o.time || "—").toString().slice(0, 10),
    }
    return { clean, event: ev }
  } catch { return { clean, event: null } }
}

export default function AIChat({ go }) {
  const [profile, setProfile] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [answers, setAnswers] = useState({})
  const [saving, setSaving] = useState(false)

  const [reports, setReports] = useState([])
  const [events, setEvents] = useState([])
  const [tasks, setTasks] = useState([])
  const [notes, setNotes] = useState([])

  const [messages, setMessages] = useState([{ role: "assistant", content: GREETING }])
  const [input, setInput] = useState("")
  const [thinking, setThinking] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    const subs = []
    try { subs.push(subscribeProfile((p) => { setProfile(p); setLoaded(true) })) } catch (e) { console.error(e) }
    try { subs.push(subscribeReports(setReports)) } catch (e) {}
    try { subs.push(subscribeEvents(setEvents)) } catch (e) {}
    try { subs.push(subscribeTasks(setTasks)) } catch (e) {}
    try { subs.push(subscribeNotes(setNotes)) } catch (e) {}
    return () => subs.forEach((u) => u && u())
  }, [])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, thinking])

  const done = !!profile?.aiSurveyDone
  const allAnswered = SURVEY.every((s) => (answers[s.id] || "").trim())

  async function submitSurvey() {
    if (!allAnswered) return
    setSaving(true)
    try { await saveSurvey(answers) } catch (e) { console.error(e); alert("Não foi possível salvar.") }
    finally { setSaving(false) }
  }

  async function send() {
    const text = input.trim()
    if (!text || thinking) return
    const next = [...messages, { role: "user", content: text }]
    setMessages(next); setInput(""); setThinking(true)
    try {
      const ctx = buildAppContext({ reports, events, tasks, notes })
      const reply = await callChat(next.filter((m) => m.role !== "system").map((m) => ({ role: m.role, content: m.content })), profile?.aiSurvey || {}, ctx)
      const { clean, event } = parseEvent(reply || "")
      setMessages((m) => [...m, { role: "assistant", content: clean || "Desculpe, não consegui responder agora.", event, eventAdded: false }])
    } catch (e) {
      console.error(e)
      setMessages((m) => [...m, { role: "assistant", content: "Tive um problema para responder. Tente novamente em instantes." }])
    } finally { setThinking(false) }
  }

  async function addEvent(idx) {
    const ev = messages[idx]?.event
    if (!ev) return
    try {
      const u = auth?.currentUser
      await createEvent({
        ...ev,
        taggedUids: u ? [u.uid] : [],
        taggedNames: u ? ["Eu mesmo"] : [],
      })
      setMessages((m) => m.map((msg, i) => i === idx ? { ...msg, eventAdded: true } : msg))
    } catch (e) { console.error(e); alert("Não foi possível adicionar o evento.") }
  }

  // ----- LOADING -----
  if (!loaded) {
    return (
      <div className="screen fn-sub-screen ai-screen">
        <div className="topbar">
          <button className="round-btn" onClick={() => go("widgets")} aria-label="Voltar"><Back size={20} /></button>
          <div className="title center">IA do Controlaí</div>
          <span style={{ width: 44 }} />
        </div>
        <p className="rec-status-msg" style={{ margin: "auto" }}>Carregando…</p>
      </div>
    )
  }

  // ----- QUESTIONÁRIO (libera o chat) -----
  if (!done) {
    return (
      <div className="screen fn-sub-screen ai-screen">
        <div className="topbar">
          <button className="round-btn" onClick={() => go("widgets")} aria-label="Voltar"><Back size={20} /></button>
          <div className="title center">IA do Controlaí</div>
          <span style={{ width: 44 }} />
        </div>

        <div className="ai-intro">
          <img src={imgIdle} alt="Controlaí" className="ai-hero-img" />
          <div className="ai-intro-title">Vamos conhecer sua operação</div>
          <div className="ai-intro-sub">Responda 10 perguntas rápidas para liberar o chat. Isso ajuda a IA a sugerir reuniões, pautas e relatórios sob medida.</div>
        </div>

        {SURVEY.map((s, i) => (
          <div className="ai-q" key={s.id}>
            <div className="ai-q-label">{i + 1}. {s.q}</div>
            {s.type === "choice" ? (
              <div className="ai-chips">
                {s.options.map((o) => (
                  <button key={o} className={`ai-chip${answers[s.id] === o ? " active" : ""}`}
                    onClick={() => setAnswers((a) => ({ ...a, [s.id]: o }))}>{o}</button>
                ))}
              </div>
            ) : (
              <input className="rec-title-input" value={answers[s.id] || ""} placeholder={s.ph}
                onChange={(e) => setAnswers((a) => ({ ...a, [s.id]: e.target.value }))}
                style={{ width: "100%" }} />
            )}
          </div>
        ))}

        <div style={{ padding: "4px 2px 28px" }}>
          <button className="pill" style={{ width: "100%", borderRadius: 16, justifyContent: "center" }}
            onClick={submitSurvey} disabled={!allAnswered || saving}>
            <Check size={18} /> {saving ? "Salvando…" : "Liberar chat"}
          </button>
          {!allAnswered && <p className="rec-status-msg" style={{ margin: "10px auto 0", fontSize: 12.5 }}>Responda todas as perguntas para continuar.</p>}
        </div>
      </div>
    )
  }

  // ----- CHAT LIBERADO -----
  return (
    <div className="screen fn-sub-screen ai-screen ai-chat-screen">
      <div className="topbar">
        <button className="round-btn" onClick={() => go("widgets")} aria-label="Voltar"><Back size={20} /></button>
        <div className="ai-head">
          <img src={thinking ? gifTalk : imgIdle} alt="Controlaí" className="ai-head-img" />
          <div>
            <div className="ai-head-name">IA do Controlaí</div>
            <div className="ai-head-status">{thinking ? "digitando…" : "gestão ágil"}</div>
          </div>
        </div>
        <span style={{ width: 44 }} />
      </div>

      <div className="ai-msgs" ref={scrollRef}>
        {messages.map((m, i) => (
          <div key={i} className={`ai-row ${m.role}`}>
            {m.role === "assistant" && (
              <img src={(thinking && i === messages.length - 1) ? gifTalk : imgIdle} alt="" className="ai-av" />
            )}
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
        <textarea
          value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send() } }}
          placeholder="Pergunte sobre relatórios, agenda, atividades…" rows={1}
        />
        <button className="ai-send" onClick={send} disabled={thinking || !input.trim()} aria-label="Enviar">➤</button>
      </div>
    </div>
  )
}
