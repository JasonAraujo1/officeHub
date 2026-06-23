import { useEffect, useMemo, useState } from "react"
import { useAuth } from "../auth.jsx"
import { isSuperadmin } from "../lib/roles.js"
import { subscribeConnections } from "../lib/team.js"
import { subscribeTasks, createTask, updateTaskStatus, assignTask, deleteTask } from "../lib/tasks.js"

const STATUS = [
  { key: "todo", label: "A fazer", color: "#c9a4ea" },
  { key: "doing", label: "Fazendo", color: "#9fc8fe" },
  { key: "done", label: "Feito", color: "#7fc98a" },
]
const colorOf = (k) => (STATUS.find((s) => s.key === k) || STATUS[0]).color

function fmtDate(v) {
  const d = v?.toDate ? v.toDate() : (typeof v?.seconds === "number" ? new Date(v.seconds * 1000) : null)
  return d ? d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }) : ""
}

export default function Kanban() {
  const { user } = useAuth()
  const canManage = isSuperadmin(user)
  const [tasks, setTasks] = useState([])
  const [connections, setConnections] = useState([])
  const [selTab, setSelTab] = useState("todo")
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ title: "", detail: "", assignedTo: "", allowMembersMove: false })

  useEffect(() => {
    const subs = []
    try { subs.push(subscribeTasks(setTasks)) } catch (e) { console.error(e) }
    try { subs.push(subscribeConnections(setConnections)) } catch (e) { console.error(e) }
    return () => subs.forEach((u) => u && u())
  }, [])

  const people = useMemo(() => [{ uid: user?.uid, name: "Eu mesmo" }, ...connections], [connections, user])
  const byStatus = (s) => tasks.filter((t) => (t.status || "todo") === s)
  const canMove = (t) => canManage || t.allowMembersMove
  const items = byStatus(selTab)

  async function save() {
    if (!form.title.trim()) return
    const p = people.find((x) => x.uid === form.assignedTo)
    try {
      await createTask({
        title: form.title.trim(), detail: form.detail.trim(),
        status: selTab, assignedTo: form.assignedTo, assignedName: p?.name || "",
        allowMembersMove: form.allowMembersMove,
      })
    } catch (e) { console.error(e); alert("Não foi possível criar a atividade.") }
    setForm({ title: "", detail: "", assignedTo: "", allowMembersMove: false })
    setAdding(false)
  }
  async function move(t, status) { try { await updateTaskStatus(t, status) } catch (e) { console.error(e) } }
  async function remove(t) { if (confirm(`Excluir "${t.title}"?`)) { try { await deleteTask(t) } catch (e) { console.error(e) } } }
  async function reassign(t, assignedTo) {
    const p = people.find((x) => x.uid === assignedTo)
    try { await assignTask(t, { assignedTo, assignedName: p?.name || "", allowMembersMove: t.allowMembersMove }) } catch (e) { console.error(e) }
  }
  async function toggleAllow(t) {
    try { await assignTask(t, { assignedTo: t.assignedTo, assignedName: t.assignedName, allowMembersMove: !t.allowMembersMove }) } catch (e) { console.error(e) }
  }

  return (
    <div className="kanban">
      <div className="kb-head">
        <span className="kb-head-title">Fluxo de trabalho</span>
        {canManage && !adding && <button className="kb-add-btn" onClick={() => setAdding(true)}>+ Nova</button>}
      </div>

      {canManage && adding && (
        <div className="kb-form">
          <input className="rec-title-input" placeholder="Título da atividade" value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} autoFocus />
          <input className="rec-title-input" placeholder="Detalhes (opcional)" value={form.detail}
            onChange={(e) => setForm((f) => ({ ...f, detail: e.target.value }))} />
          <select className="rec-title-input" value={form.assignedTo}
            onChange={(e) => setForm((f) => ({ ...f, assignedTo: e.target.value }))}>
            <option value="">Designar para…</option>
            {people.map((p) => <option key={p.uid} value={p.uid}>{p.name}</option>)}
          </select>
          <label className="kb-check">
            <input type="checkbox" checked={form.allowMembersMove}
              onChange={(e) => setForm((f) => ({ ...f, allowMembersMove: e.target.checked }))} />
            Permitir que o usuário mova o status
          </label>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="pill ghost" style={{ flex: 1, borderRadius: 14 }} onClick={() => setAdding(false)}>Cancelar</button>
            <button className="pill" style={{ flex: 1, borderRadius: 14 }} onClick={save}>Salvar em "{STATUS.find((s) => s.key === selTab).label}"</button>
          </div>
        </div>
      )}

      {/* abas-pílula de status */}
      <div className="kb-tabs">
        {STATUS.map((s) => (
          <button key={s.key}
            className={`kb-tab${selTab === s.key ? " active" : ""}`}
            style={selTab === s.key ? { borderBottomColor: s.color, color: "#000" } : null}
            onClick={() => setSelTab(s.key)}>
            {s.label} <span className="kb-tabcount">{byStatus(s.key).length}</span>
          </button>
        ))}
      </div>

      {/* grade de cards do status selecionado */}
      {items.length === 0 ? (
        <p className="kb-empty">Nenhuma atividade em "{STATUS.find((s) => s.key === selTab).label}".</p>
      ) : (
        <div className="kb-grid">
          {items.map((t) => (
            <div className="kb-card" key={t.id} style={{ borderTop: `3px solid ${colorOf(t.status || "todo")}` }}>
              <div className="kb-card-label" style={{ color: colorOf(t.status || "todo") }}>
                {t.assignedName ? `@${t.assignedName}` : "Atividade"}
              </div>
              <div className="kb-card-title">{t.title}</div>
              {t.detail && <div className="kb-card-detail">{t.detail}</div>}
              <div className="kb-card-foot">{fmtDate(t.createdAt)}</div>

              {canMove(t) && (
                <div className="kb-move">
                  {STATUS.map((c) => (
                    <button key={c.key}
                      className={`kb-move-btn${(t.status || "todo") === c.key ? " active" : ""}`}
                      onClick={() => move(t, c.key)} title={c.label}>
                      {c.label}
                    </button>
                  ))}
                </div>
              )}

              {canManage && (
                <div className="kb-manage">
                  <select value={t.assignedTo || ""} onChange={(e) => reassign(t, e.target.value)}>
                    <option value="">Sem responsável</option>
                    {people.map((p) => <option key={p.uid} value={p.uid}>{p.name}</option>)}
                  </select>
                  <label className="kb-check sm">
                    <input type="checkbox" checked={!!t.allowMembersMove} onChange={() => toggleAllow(t)} />
                    Pode mover
                  </label>
                  <button className="kb-del" onClick={() => remove(t)} aria-label="Excluir">✕</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
