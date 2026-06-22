import { useEffect, useMemo, useState } from "react"
import { useAuth } from "../auth.jsx"
import { isSuperadmin } from "../lib/roles.js"
import { subscribeConnections } from "../lib/team.js"
import { subscribeTasks, createTask, updateTaskStatus, assignTask, deleteTask } from "../lib/tasks.js"

const COLUMNS = [
  { key: "todo", label: "A fazer", color: "#ff945e" },
  { key: "doing", label: "Fazendo", color: "#ffd439" },
  { key: "done", label: "Feito", color: "#7fc98a" },
]
const STATUS_LABEL = { todo: "A fazer", doing: "Fazendo", done: "Feito" }

export default function Kanban() {
  const { user } = useAuth()
  const canManage = isSuperadmin(user)
  const [tasks, setTasks] = useState([])
  const [connections, setConnections] = useState([])
  const [open, setOpen] = useState({ todo: true, doing: true, done: false })
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ title: "", detail: "", assignedTo: "", allowMembersMove: false })

  useEffect(() => {
    const subs = []
    try { subs.push(subscribeTasks(setTasks)) } catch (e) { console.error(e) }
    try { subs.push(subscribeConnections(setConnections)) } catch (e) { console.error(e) }
    return () => subs.forEach((u) => u && u())
  }, [])

  const people = useMemo(
    () => [{ uid: user?.uid, name: "Eu mesmo" }, ...connections],
    [connections, user]
  )
  const byStatus = (s) => tasks.filter((t) => (t.status || "todo") === s)
  const canMove = (t) => canManage || t.allowMembersMove

  async function save() {
    if (!form.title.trim()) return
    const p = people.find((x) => x.uid === form.assignedTo)
    try {
      await createTask({
        title: form.title.trim(),
        detail: form.detail.trim(),
        assignedTo: form.assignedTo,
        assignedName: p?.name || "",
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
      {canManage && (
        <div className="kb-add">
          {!adding ? (
            <button className="pill block" onClick={() => setAdding(true)}>+ Nova atividade</button>
          ) : (
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
                <button className="pill" style={{ flex: 1, borderRadius: 14 }} onClick={save}>Salvar</button>
              </div>
            </div>
          )}
        </div>
      )}

      {COLUMNS.map((col) => {
        const items = byStatus(col.key)
        const isOpen = open[col.key]
        return (
          <div className="kb-col" key={col.key}>
            <button className="kb-col-head" onClick={() => setOpen((o) => ({ ...o, [col.key]: !o[col.key] }))}>
              <span className="kb-dot" style={{ background: col.color }} />
              <span className="kb-col-title">{col.label}</span>
              <span className="kb-count">{items.length}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .2s", marginLeft: "auto" }}>
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {isOpen && (
              <div className="kb-cards">
                {items.length === 0 ? (
                  <p className="kb-empty">Nenhuma atividade.</p>
                ) : items.map((t) => (
                  <div className="kb-card" key={t.id}>
                    <div className="kb-card-title">{t.title}</div>
                    {t.detail && <div className="kb-card-detail">{t.detail}</div>}
                    {t.assignedName && <span className="kb-assignee">@{t.assignedName}</span>}

                    {/* mover status: controller sempre; usuário comum só se permitido */}
                    {canMove(t) && (
                      <div className="kb-move">
                        {COLUMNS.map((c) => (
                          <button key={c.key}
                            className={`kb-move-btn${(t.status || "todo") === c.key ? " active" : ""}`}
                            onClick={() => move(t, c.key)}>
                            {STATUS_LABEL[c.key]}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* designar / permissão / excluir: só controller */}
                    {canManage && (
                      <div className="kb-manage">
                        <select value={t.assignedTo || ""} onChange={(e) => reassign(t, e.target.value)}>
                          <option value="">Sem responsável</option>
                          {people.map((p) => <option key={p.uid} value={p.uid}>{p.name}</option>)}
                        </select>
                        <label className="kb-check sm">
                          <input type="checkbox" checked={!!t.allowMembersMove} onChange={() => toggleAllow(t)} />
                          Usuário pode mover
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
      })}
    </div>
  )
}
