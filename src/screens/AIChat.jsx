import { useEffect, useRef, useState } from "react"
import { Back, Check } from "../icons.jsx"
import { SURVEY, saveSurvey, callChat } from "../lib/ai.js"
import { subscribeProfile } from "../lib/team.js"
import gifTalk from "../assets/logo.gif"
import imgIdle from "../assets/prancheta.png"

const GREETING = "Olá! Sou a IA do Controlaí, sua assistente de gestão ágil. Já conheço o perfil da sua equipe — posso sugerir formatos de reunião, pautas, atividades, palestras e modelos de relatório, ou tirar dúvidas. Por onde começamos?"

export default function AIChat({ go }) {
  const [profile, setProfile] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [answers, setAnswers] = useState({})
  const [saving, setSaving] = useState(false)

  const [messages, setMessages] = useState([{ role: "assistant", content: GREETING }])
  const [input, setInput] = useState("")
  const [thinking, setThinking] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    let unsub
    try { unsub = subscribeProfile((p) => { setProfile(p); setLoaded(true) }) } catch (e) { console.error(e) }
    return () => unsub && unsub()
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
      const reply = await callChat(next.filter((m) => m.role !== "system"), profile?.aiSurvey || {})
      setMessages((m) => [...m, { role: "assistant", content: reply || "Desculpe, não consegui responder agora." }])
    } catch (e) {
      console.error(e)
      setMessages((m) => [...m, { role: "assistant", content: "Tive um problema para responder. Tente novamente em instantes." }])
    } finally { setThinking(false) }
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
            <div className={`ai-bubble ${m.role}`}>{m.content}</div>
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
          placeholder="Pergunte sobre reuniões, pautas, relatórios…" rows={1}
        />
        <button className="ai-send" onClick={send} disabled={thinking || !input.trim()} aria-label="Enviar">➤</button>
      </div>
    </div>
  )
}
