import { useEffect, useRef, useState } from "react"
import { Back, Check, FileText, X } from "../icons.jsx"
import { subscribeProfile, setReportPrompt } from "../lib/team.js"

const EXEMPLO = `Ex.: "Quero o relatório em tom formal. Destaque prazos com datas. Liste pendências com o responsável. Organize a análise por assunto, com subtítulos."`

export default function ReportModel({ go }) {
  const [text, setText] = useState("")
  const [loaded, setLoaded] = useState(false)
  const [busy, setBusy] = useState(false)
  const [okMsg, setOkMsg] = useState(false)
  const fileRef = useRef(null)

  useEffect(() => {
    let unsub
    try {
      unsub = subscribeProfile((p) => {
        if (!loaded) { setText(p?.reportPrompt || ""); setLoaded(true) }
      })
    } catch (e) { console.error(e) }
    return () => unsub && unsub()
  }, [loaded])

  async function save() {
    setBusy(true)
    try {
      await setReportPrompt(text.trim())
      setOkMsg(true); setTimeout(() => setOkMsg(false), 2500)
    } catch (e) { console.error(e); alert("Não foi possível salvar.") }
    finally { setBusy(false) }
  }

  async function clearAll() {
    setText("")
    try { await setReportPrompt("") } catch (e) { console.error(e) }
  }

  function onFile(e) {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => {
      const content = String(reader.result || "").trim()
      setText((t) => (t ? t + "\n\n" : "") + content)
    }
    reader.onerror = () => alert("Não foi possível ler o arquivo.")
    reader.readAsText(f)
    e.target.value = ""
  }

  return (
    <div className="screen fn-sub-screen reportmodel-screen">
      <div className="topbar">
        <button className="round-btn" onClick={() => go("reports")} aria-label="Voltar"><Back size={20} /></button>
        <div className="title center">Modelo do relatório</div>
        <span style={{ width: 44 }} />
      </div>

      <div className="profile-head" style={{ paddingTop: 14 }}>
        <div className="profile-avatar"><FileText size={32} /></div>
        <div className="profile-name">Como formatar seus relatórios</div>
        <div className="profile-email">Escreva instruções ou carregue um documento de referência. Vale para os próximos relatórios.</div>
      </div>

      {okMsg && <div className="push-banner on" style={{ background: "rgba(255,255,255,.5)" }}><Check size={15} /> Modelo salvo!</div>}

      <div className="list-card" style={{ padding: 16 }}>
        <div className="row-label" style={{ marginBottom: 10 }}>Instruções de formatação (prompt)</div>
        <textarea
          className="rec-title-input" rows={8} value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={EXEMPLO}
          style={{ width: "100%", resize: "vertical", lineHeight: 1.5 }}
        />
        <input ref={fileRef} type="file" accept=".txt,.md,.markdown,text/plain" onChange={onFile} style={{ display: "none" }} />
        <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
          <button className="pill ghost" style={{ flex: 1, borderRadius: 14, minWidth: 140 }} onClick={() => fileRef.current?.click()}>
            <FileText size={17} /> Carregar de arquivo
          </button>
          {text.trim() && (
            <button className="pill ghost" style={{ borderRadius: 14 }} onClick={clearAll}><X size={17} /> Limpar</button>
          )}
        </div>
      </div>

      <p className="rec-status-msg" style={{ margin: "6px auto 14px", fontSize: 12.5 }}>
        Arquivos de texto (.txt, .md). Para PDF/Word, copie o conteúdo e cole acima.
      </p>

      <div style={{ padding: "0 2px 24px" }}>
        <button className="pill" style={{ width: "100%", borderRadius: 16, justifyContent: "center" }} onClick={save} disabled={busy}>
          <Check size={18} /> Salvar modelo
        </button>
      </div>
    </div>
  )
}
