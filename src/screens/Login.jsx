import { useState } from "react"
import { useAuth } from "../auth.jsx"
import WaveHeader from "../components/WaveHeader.jsx"
import { Mic } from "../icons.jsx"

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8a12 12 0 1 1 7.9-21l5.7-5.7A20 20 0 1 0 24 44a20 20 0 0 0 19.6-23.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8A12 12 0 0 1 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7A20 20 0 0 0 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A12 12 0 0 1 12.7 28l-6.5 5A20 20 0 0 0 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C39.9 35.5 44 30.4 44 24c0-1.2-.1-2.4-.4-3.5z"/>
    </svg>
  )
}

export default function Login() {
  const { login, signup, loginGoogle } = useAuth()
  const [mode, setMode] = useState("login")
  const [email, setEmail] = useState("")
  const [pass, setPass] = useState("")
  const [err, setErr] = useState("")
  const [busy, setBusy] = useState(false)

  async function google() {
    setErr("")
    setBusy(true)
    try {
      await loginGoogle()
    } catch (e) {
      setErr(e?.message?.replace("Firebase:", "").trim() || "Erro no login com Google")
    } finally {
      setBusy(false)
    }
  }

  async function submit(e) {
    e.preventDefault()
    setErr("")
    setBusy(true)
    try {
      if (mode === "login") await login(email, pass)
      else await signup(email, pass)
    } catch (e) {
      setErr(e?.message?.replace("Firebase:", "").trim() || "Erro ao entrar")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="screen">
      <WaveHeader>
        <div className="greet-date">controllerHub</div>
        <h1 className="greet-h1">{mode === "login" ? "Entrar" : "Criar conta"}</h1>
        <p className="greet-sub">Grave, transcreva e gere relatórios.</p>
      </WaveHeader>

      <form className="auth-form" onSubmit={submit}>
        <label className="field">
          <span>E-mail</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </label>
        <label className="field">
          <span>Senha</span>
          <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} required minLength={6} autoComplete="current-password" />
        </label>

        {err && <p className="form-err">{err}</p>}

        <button className="action-btn primary" type="submit" disabled={busy}>
          <span className="ic"><Mic size={18} /></span>
          {busy ? "Aguarde..." : mode === "login" ? "Entrar" : "Cadastrar"}
        </button>
      </form>

      <div className="auth-divider"><span>ou</span></div>

      <button className="action-btn google-btn" onClick={google} disabled={busy}>
        <GoogleIcon /> Continuar com Google
      </button>

      <button
        className="auth-switch"
        onClick={() => { setErr(""); setMode(mode === "login" ? "signup" : "login") }}
      >
        {mode === "login" ? "Não tem conta? Criar uma" : "Já tem conta? Entrar"}
      </button>
    </div>
  )
}
