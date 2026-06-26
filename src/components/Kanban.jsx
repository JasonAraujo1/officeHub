import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "../auth.jsx"
import { isSuperadmin } from "../lib/roles.js"
import { subscribeConnections } from "../lib/team.js"
import { subscribeTasks, createTask, updateTaskStatus, assignTask, deleteTask } from "../lib/tasks.js"
import { textOn, FN_COLORS } from "../lib/colors.js"

// Pares claro/escuro das 6 cores (DESIGN_COLORS.md) — usamos 3 para os status:
const COLUMNS = [
  { key: "todo", label: "A fazer", ...FN_COLORS.calendar },  // lilás
  { key: "doing", label: "Fazendo", ...FN_COLORS.tools },    // azul
  { key: "done", label: "Feito", ...FN_COLORS.home },        // verde
]

function fmtDate(v) {
  const d = v?.toDate ? v.toDate() : (typeof v?.seconds === "number" ? new Date(v.seconds * 1000) : null)
  return d ? d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }) : ""
}
const initials = (name) => (name || "?").trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase()

export default function Kanban() {
  const { user } = useAuth()
  const canManage = isSuperadmin(user)
  const [tasks, setTasks] = useState([])
  const [connections, setConnections] = useState([])
  const [open, setOpen] = useState({ todo: false, doing: false, done: false })
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
  const peopleOf = (items) => [...new Set(items.map((t) => t.assignedName).filter(Boolean))]
  const aiSummary = (items) =>
    items.length === 0 ? "Nenhuma atividade ainda." : `Sobre: ${items.slice(0, 3).map((t) => t.title).join(" · ")}${items.length > 3 ? "…" : ""}`

  async function save() {
    if (!form.title.trim()) return
    const p = people.find((x) => x.uid === form.assignedTo)
    try {
      await createTask({
        title: form.title.trim(), detail: form.detail.trim(),
        assignedTo: form.assignedTo, assignedName: p?.name || "",
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

      <AnimatePresence initial={false}>
        {canManage && adding && (
          <motion.div className="kb-form" key="form"
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }} style={{ overflow: "hidden" }}>
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
          </motion.div>
        )}
      </AnimatePresence>

      {COLUMNS.map((col) => {
        const items = byStatus(col.key)
        const ppl = peopleOf(items)
        const isOpen = open[col.key]
        const headText = textOn(col.light)
        const aiBg = col.dark
        const aiText = textOn(aiBg)
        return (
          <div className="kb-col" key={col.key} style={{ background: `color-mix(in srgb, ${col.light} 48%, transparent)`, color: headText }}>
            <button className="kb-col-head" onClick={() => setOpen((o) => ({ ...o, [col.key]: !o[col.key] }))}>
              <div className="kb-col-headl">
                <span className="kb-col-title" style={{ color: headText }}>{col.label}</span>
                <span className="kb-col-meta" style={{ color: headText, opacity: 0.8 }}>{items.length} {items.length === 1 ? "tarefa" : "tarefas"} · {ppl.length} {ppl.length === 1 ? "pessoa" : "pessoas"}</span>
              </div>
              <div className="kb-avatars">
                {ppl.slice(0, 4).map((n) => <span className="kb-av" key={n} title={n}>{initials(n)}</span>)}
                {ppl.length > 4 && <span className="kb-av more">+{ppl.length - 4}</span>}
              </div>
              <motion.svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" style={{ color: headText }} animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <path d="M6 9l6 6 6-6" />
              </motion.svg>
            </button>

            {/* faixa de resumo de IA — cor do card, porém mais escura */}
            <div className="kb-ai" style={{ background: `color-mix(in srgb, ${aiBg} 55%, transparent)`, color: aiText }}>
              <span className="kb-ai-label" style={{ color: aiText }}>Resumo IA</span>
              <p className="kb-ai-text" style={{ color: aiText }}>{aiSummary(items)}</p>
              {ppl.length > 0 && (
                <div className="kb-avatars sm">
                  {ppl.slice(0, 5).map((n) => <span className="kb-av light" key={n} title={n}>{initials(n)}</span>)}
                </div>
              )}
            </div>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div key="body"
                  initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }} style={{ overflow: "hidden" }}>
                  <div className="kb-cards">
                    {items.length === 0 ? (
                      <p className="kb-empty">Nenhuma atividade.</p>
                    ) : (
                      <AnimatePresence initial={false}>
                        {items.map((t) => (
                          <motion.div className="kb-card" key={t.id} layout
                            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
                            transition={{ duration: 0.18 }}>
                            <div className="kb-card-title">{t.title}</div>
                            {t.detail && <div className="kb-card-detail">{t.detail}</div>}
                            <div className="kb-card-foot">
                              {t.assignedName && <span className="kb-assignee">@{t.assignedName}</span>}
                              <span className="kb-date">{fmtDate(t.createdAt)}</span>
                            </div>

                            {canMove(t) && (
                              <div className="kb-move">
                                {COLUMNS.map((c) => (
                                  <button key={c.key} className={`kb-move-btn${(t.status || "todo") === c.key ? " active" : ""}`}
                                    onClick={() => move(t, c.key)}>{c.label}</button>
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
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
