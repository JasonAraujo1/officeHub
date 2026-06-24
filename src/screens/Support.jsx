import { useEffect, useState } from "react"
import { Back, Help, Check, X } from "../icons.jsx"
import { subscribeSupport, createSupportRequest, countToday, SUPPORT_MAX_PER_DAY } from "../lib/support.js"

const OPCOES = [
  "Problema ao gravar áudio",
  "Erro ao gerar relatório",
  "Conta e login",
  "Pagamento e plano",
  "Sugestão de melhoria",
]

export default function Support({ go }) {
  const [list, setList] = useState([])
  const [outros, setOutros] = useState(false)
  const [texto, setTexto] = useState("")
  const [busy, setBusy] = useState(false)
  const [okMsg, setOkMsg] = useState(false)

  useEffect(() => {
    let unsub
    try { unsub = subscribeSupport(setList) } catch (e) { console.error(e) }
    return () => unsub && unsub()
  }, [])

  const usados = countToday(list)
  const restantes = Math.max(0, SUPPORT_MAX_PER_DAY - usados)

  async function enviar(category, message = "") {
    if (restantes <= 0) { alert(`Você atingiu o limite de ${SUPPORT_MAX_PER_DAY} pedidos por dia.`); return }
    setBusy(true)
    try {
      await createSupportRequest(category, message)
      setOkMsg(true); setOutros(false); setTexto("")
      setTimeout(() => setOkMsg(false), 2500)
    } catch (e) { console.error(e); alert("Não foi possível enviar o pedido.") }
    finally { setBusy(false) }
  }

  return (
    <div className="screen fn-sub-screen support-screen">
      <div className="topbar">
        <button className="round-btn" onClick={() => go("widgets")} aria-label="Voltar"><Back size={20} /></button>
        <div className="title center">Suporte</div>
        <span style={{ width: 44 }} />
      </div>

      <div className="profile-head" style={{ paddingTop: 14 }}>
        <div className="profile-avatar"><Help size={34} /></div>
        <div className="profile-name">Como podemos ajudar?</div>
        <div className="profile-email">Escolha um assunto e envie seu pedido.</div>
      </div>

      <div className="settings-section">Pedidos hoje: {usados}/{SUPPORT_MAX_PER_DAY}</div>

      {okMsg && <div className="push-banner on" style={{ background: "rgba(255,255,255,.5)" }}><Check size={15} /> Pedido enviado! Vamos responder em breve.</div>}

      <div className="list-card">
        {OPCOES.map((op) => (
          <button key={op} className="row-item" onClick={() => enviar(op)} disabled={busy || restantes <= 0}>
            <span className="row-ic"><Help size={18} /></span>
            <span className="row-label">{op}</span>
          </button>
        ))}
        <button className="row-item" onClick={() => setOutros((v) => !v)} disabled={busy || restantes <= 0}>
          <span className="row-ic"><Help size={18} /></span>
          <span className="row-label">Outros</span>
        </button>
      </div>

      {outros && (
        <div className="list-card" style={{ padding: 16, marginTop: 12 }}>
          <div className="row-label" style={{ marginBottom: 10 }}>Descreva seu pedido</div>
          <textarea className="rec-title-input" rows={4} value={texto}
            onChange={(e) => setTexto(e.target.value)} placeholder="Escreva aqui…"
            style={{ width: "100%", resize: "vertical" }} />
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button className="pill ghost" style={{ flex: 1, borderRadius: 14 }} onClick={() => setOutros(false)}><X size={18} /> Cancelar</button>
            <button className="pill" style={{ flex: 1, borderRadius: 14 }} disabled={busy || !texto.trim()} onClick={() => enviar("Outros", texto.trim())}><Check size={18} /> Enviar</button>
          </div>
        </div>
      )}

      {restantes <= 0 && (
        <p className="rec-status-msg" style={{ margin: "14px auto" }}>Limite diário atingido. Tente novamente amanhã.</p>
      )}
    </div>
  )
}
