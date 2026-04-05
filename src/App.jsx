import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from './supabase'

// ─── Helpers ─────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9)
const todayS = () => new Date().toISOString().split('T')[0]
const tmrwS = () => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0] }
const fmtD = (s) => { if (!s) return ''; const d = new Date(s + 'T00:00:00'); return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }
const isOv = (d) => d && d < todayS()
const isTd = (d) => d === todayS()
const isTm = (d) => d === tmrwS()

const PRI = {
  1: { l: 'P1', c: '#e05252', b: '#fde8e8' },
  2: { l: 'P2', c: '#e8832a', b: '#fef3e2' },
  3: { l: 'P3', c: '#4a90d9', b: '#e8f2fd' },
  4: { l: 'P4', c: '#9ca3af', b: '#f3f4f6' },
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const ICONS = {
  inbox:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/></svg>,
  today:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  upc:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01M12 14h.01M16 14h.01"/></svg>,
  filt:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  lbl:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><circle cx="7" cy="7" r="1" fill="currentColor"/></svg>,
  plus:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  chk:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>,
  trash:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>,
  edit:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  x:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  send:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  srch:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  bell:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  bot:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/><circle cx="12" cy="16" r="1.5" fill="currentColor" stroke="none"/></svg>,
  menu:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  cl:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  loader: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>,
}

const I = ({ n, s = 15 }) => (
  <span style={{ width: s, height: s, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
    {React.cloneElement(ICONS[n] || ICONS.chk, { width: s, height: s })}
  </span>
)

// ─── DB helpers ───────────────────────────────────────────────────────────────
const toTask = (row) => ({
  id: row.id,
  title: row.title,
  notes: row.notes || '',
  due: row.due || '',
  priority: row.priority,
  projectId: row.project_id,
  labels: row.labels || [],
  reminder: row.reminder || '',
  recurrence: row.recurrence || '',
  subtasks: row.subtasks || [],
  completed: row.completed,
  completedAt: row.completed_at,
  createdAt: row.created_at,
})

const fromTask = (t) => ({
  id: t.id,
  title: t.title,
  notes: t.notes || '',
  due: t.due || '',
  priority: t.priority || 4,
  project_id: t.projectId || 'inbox',
  labels: t.labels || [],
  reminder: t.reminder || '',
  recurrence: t.recurrence || '',
  subtasks: t.subtasks || [],
  completed: t.completed || false,
  completed_at: t.completedAt || null,
})

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [tasks,   setTasks]   = useState([])
  const [projs,   setProjs]   = useState([])
  const [labels,  setLabels]  = useState([])
  const [filters, setFilters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const [view,     setView]     = useState('today')
  const [selP,     setSelP]     = useState(null)
  const [selL,     setSelL]     = useState(null)
  const [selF,     setSelF]     = useState(null)
  const [showAdd,  setShowAdd]  = useState(false)
  const [editT,    setEditT]    = useState(null)
  const [showChat, setShowChat] = useState(false)
  const [showSrch, setShowSrch] = useState(false)
  const [showAP,   setShowAP]   = useState(false)
  const [showAL,   setShowAL]   = useState(false)
  const [showCL,   setShowCL]   = useState(false)
  const [sidebar,  setSidebar]  = useState(true)
  const [sort,     setSort]     = useState('due')
  const [showDone, setShowDone] = useState(false)

  // ── Fetch all data on mount ──
  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    setError(null)
    try {
      const [t, p, l, f] = await Promise.all([
        supabase.from('tasks').select('*').order('created_at', { ascending: true }),
        supabase.from('projects').select('*').order('order', { ascending: true }),
        supabase.from('labels').select('*').order('created_at', { ascending: true }),
        supabase.from('filters').select('*').order('created_at', { ascending: true }),
      ])
      if (t.error) throw t.error
      if (p.error) throw p.error
      if (l.error) throw l.error
      if (f.error) throw f.error
      setTasks(t.data.map(toTask))
      setProjs(p.data)
      setLabels(l.data)
      setFilters(f.data)
    } catch (err) {
      setError('Could not connect to database. Check your Supabase credentials.')
      console.error(err)
    }
    setLoading(false)
  }

  // ── Task CRUD ──
  const addT = async (t) => {
    const newTask = { ...fromTask(t), id: uid(), created_at: new Date().toISOString() }
    const { data, error } = await supabase.from('tasks').insert(newTask).select().single()
    if (!error && data) setTasks(prev => [...prev, toTask(data)])
  }

  const updT = async (id, patch) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t))
    const row = fromTask({ ...tasks.find(t => t.id === id), ...patch })
    await supabase.from('tasks').update(row).eq('id', id)
  }

  const delT = async (id) => {
    setTasks(prev => prev.filter(t => t.id !== id))
    await supabase.from('tasks').delete().eq('id', id)
  }

  const togT = async (id) => {
    const task = tasks.find(t => t.id === id)
    const completed = !task.completed
    const completedAt = completed ? new Date().toISOString() : null
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed, completedAt } : t))
    await supabase.from('tasks').update({ completed, completed_at: completedAt }).eq('id', id)
  }

  // ── Project / Label CRUD ──
  const addProj = async ({ name, color }) => {
    const row = { id: uid(), name, color, order: projs.length }
    const { data, error } = await supabase.from('projects').insert(row).select().single()
    if (!error && data) setProjs(prev => [...prev, data])
  }

  const addLabel = async ({ name, color }) => {
    const row = { id: uid(), name, color }
    const { data, error } = await supabase.from('labels').insert(row).select().single()
    if (!error && data) setLabels(prev => [...prev, data])
  }

  // ── View filtering & sorting ──
  const getVisible = () => {
    let r = [...tasks]
    if (view === 'today')    r = r.filter(t => (isTd(t.due) || (isOv(t.due) && !t.completed)))
    else if (view === 'upcoming') r = r.filter(t => t.due && t.due >= todayS() && !t.completed)
    else if (view === 'inbox')    r = r.filter(t => t.projectId === 'inbox')
    else if (view === 'project' && selP)  r = r.filter(t => t.projectId === selP)
    else if (view === 'label'   && selL)  r = r.filter(t => t.labels?.includes(selL))
    else if (view === 'filter'  && selF) {
      const f = filters.find(x => x.id === selF)
      if (f) {
        if (f.query.startsWith('priority:')) { const ps = f.query.split(':')[1].split(',').map(Number); r = r.filter(t => ps.includes(t.priority)) }
        else if (f.query === 'due:week') { const w = new Date(); w.setDate(w.getDate() + 7); const ws = w.toISOString().split('T')[0]; r = r.filter(t => t.due && t.due >= todayS() && t.due <= ws) }
        else if (f.query === 'no-due') r = r.filter(t => !t.due)
      }
    }
    r.sort((a, b) => {
      if (sort === 'priority') return a.priority - b.priority
      if (sort === 'due') { if (!a.due && !b.due) return 0; if (!a.due) return 1; if (!b.due) return -1; return a.due.localeCompare(b.due) }
      if (sort === 'title') return a.title.localeCompare(b.title)
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
    return r
  }

  const all    = getVisible()
  const active = all.filter(t => !t.completed)
  const done   = all.filter(t => t.completed)
  const totAct = tasks.filter(t => !t.completed).length
  const totDone= tasks.filter(t => t.completed).length
  const pct    = tasks.length ? Math.round(totDone / tasks.length * 100) : 0

  const nav = (v, p = null, l = null, f = null) => { setView(v); setSelP(p); setSelL(l); setSelF(f) }
  const title = () => {
    if (view === 'today')    return 'Today'
    if (view === 'upcoming') return 'Upcoming'
    if (view === 'inbox')    return 'Inbox'
    if (view === 'project')  return projs.find(p => p.id === selP)?.name || 'Project'
    if (view === 'label')    return '# ' + (labels.find(l => l.id === selL)?.name || 'Label')
    if (view === 'filter')   return filters.find(f => f.id === selF)?.name || 'Filter'
    return 'Tasks'
  }

  const COLORS = ['#4a90d9','#8b5cf6','#22c55e','#e05252','#e8832a','#eab308','#14b8a6','#ec4899','#64748b']

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 16, color: '#94a3b8' }}>
      <span className="spin" style={{ display: 'inline-flex' }}><I n="loader" s={28} /></span>
      <span style={{ fontSize: 14 }}>Connecting to Supabase…</span>
    </div>
  )

  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 12, color: '#e05252', padding: 32, textAlign: 'center' }}>
      <div style={{ fontSize: 40 }}>⚠️</div>
      <div style={{ fontSize: 16, fontWeight: 500 }}>Database connection failed</div>
      <div style={{ fontSize: 13, color: '#94a3b8', maxWidth: 400 }}>{error}</div>
      <button className="bp" onClick={fetchAll} style={{ marginTop: 8 }}>Retry</button>
    </div>
  )

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f7f8fc', overflow: 'hidden' }}>
      {/* SIDEBAR */}
      {sidebar && (
        <aside style={{ width: 242, background: '#fafbff', borderRight: '1px solid #eaedf5', display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 14px 8px', display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 29, height: 29, background: 'linear-gradient(135deg,#4a90d9,#7c5cf6)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14 }}>✓</div>
            <span style={{ fontWeight: 700, fontSize: 16 }}>Taskly</span>
            <span style={{ marginLeft: 'auto', fontSize: 10, background: '#e8f2fd', color: '#4a90d9', padding: '2px 6px', borderRadius: 4, fontWeight: 500 }}>Supabase ✓</span>
          </div>
          <div style={{ padding: '0 10px 6px' }}>
            <button className="si" onClick={() => setShowSrch(true)} style={{ background: '#f0f2f8', border: '1.5px solid #eaedf5', color: '#94a3b8', fontSize: 12.5 }}>
              <I n="srch" s={13} /><span>Search tasks…</span>
            </button>
          </div>
          <nav style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
            {[
              { id: 'inbox',    icon: 'inbox', lbl: 'Inbox',    cnt: tasks.filter(t => t.projectId === 'inbox' && !t.completed).length },
              { id: 'today',    icon: 'today', lbl: 'Today',    cnt: tasks.filter(t => (isTd(t.due) || isOv(t.due)) && !t.completed).length },
              { id: 'upcoming', icon: 'upc',   lbl: 'Upcoming', cnt: 0 },
            ].map(item => (
              <button key={item.id} className={`si ${view === item.id && !selP && !selL && !selF ? 'act' : ''}`} onClick={() => nav(item.id)}>
                <I n={item.icon} s={14} /><span style={{ flex: 1 }}>{item.lbl}</span>
                {item.cnt > 0 && <span style={{ fontSize: 11, fontWeight: 500, color: view === item.id ? '#4a90d9' : '#b0bec9' }}>{item.cnt}</span>}
              </button>
            ))}

            <div className="ss">Projects</div>
            {projs.map(p => (
              <button key={p.id} className={`si ${view === 'project' && selP === p.id ? 'act' : ''}`} onClick={() => nav('project', p.id)}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{p.name}</span>
                <span style={{ fontSize: 11, color: '#b0bec9' }}>{tasks.filter(t => t.projectId === p.id && !t.completed).length || ''}</span>
              </button>
            ))}
            <button className="si" style={{ color: '#b0bec9', fontSize: 12.5 }} onClick={() => setShowAP(true)}><I n="plus" s={12} /><span>Add project</span></button>

            <div className="ss">Labels</div>
            {labels.map(l => (
              <button key={l.id} className={`si ${view === 'label' && selL === l.id ? 'act' : ''}`} onClick={() => nav('label', null, l.id)}>
                <span style={{ color: l.color, display: 'flex', alignItems: 'center' }}><I n="lbl" s={13} /></span>
                <span style={{ flex: 1, color: l.color }}>{l.name}</span>
              </button>
            ))}
            <button className="si" style={{ color: '#b0bec9', fontSize: 12.5 }} onClick={() => setShowAL(true)}><I n="plus" s={12} /><span>Add label</span></button>

            <div className="ss">Filters</div>
            {filters.map(f => (
              <button key={f.id} className={`si ${view === 'filter' && selF === f.id ? 'act' : ''}`} onClick={() => nav('filter', null, null, f.id)}>
                <I n="filt" s={13} /><span style={{ flex: 1 }}>{f.name}</span>
              </button>
            ))}
          </nav>
          <div style={{ padding: '10px 14px 14px', borderTop: '1px solid #eaedf5' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, alignItems: 'center' }}>
              <span style={{ fontSize: 11.5, color: '#94a3b8' }}>{totAct} active · {pct}% done</span>
              <button onClick={() => setShowCL(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b0bec9', display: 'flex', padding: 2 }}><I n="cl" s={13} /></button>
            </div>
            <div className="pb"><div className="pf" style={{ width: pct + '%' }} /></div>
          </div>
        </aside>
      )}

      {/* MAIN */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <header style={{ padding: '13px 26px', borderBottom: '1px solid #eaedf5', background: 'white', display: 'flex', alignItems: 'center', gap: 11, flexShrink: 0 }}>
          <button onClick={() => setSidebar(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', padding: 4, borderRadius: 6 }}><I n="menu" s={17} /></button>
          <h1 style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.3px', flex: 1 }}>{title()}</h1>
          <select value={sort} onChange={e => setSort(e.target.value)} style={{ padding: '5px 10px', border: '1.5px solid #e2e8f0', borderRadius: 7, fontSize: 12.5, color: '#374151', background: 'white', cursor: 'pointer', outline: 'none', fontFamily: 'Roboto, sans-serif' }}>
            <option value="due">By due date</option>
            <option value="priority">By priority</option>
            <option value="title">By name</option>
            <option value="created">Newest first</option>
          </select>
          <button className="bp" onClick={() => setShowAdd(true)}><I n="plus" s={13} />Add task</button>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 26px' }}>
          {active.length === 0 && done.length === 0 && (
            <div style={{ textAlign: 'center', padding: '64px 20px', color: '#94a3b8' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🌿</div>
              <div style={{ fontSize: 17, fontWeight: 500, color: '#2d3748', marginBottom: 6 }}>All clear!</div>
              <div style={{ fontSize: 13.5 }}>No tasks here. Click <strong>+ Add task</strong> to get started.</div>
            </div>
          )}
          {active.map(t => <TaskRow key={t.id} task={t} projs={projs} labels={labels} onToggle={() => togT(t.id)} onEdit={() => setEditT(t)} onDelete={() => delT(t.id)} />)}
          {done.length > 0 && (
            <div style={{ marginTop: 18 }}>
              <button onClick={() => setShowDone(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#94a3b8', padding: '5px 0', fontFamily: 'Roboto, sans-serif' }}>
                <span style={{ transform: showDone ? 'rotate(90deg)' : 'none', transition: 'transform .15s', display: 'inline-block', fontSize: 10 }}>▶</span>
                {done.length} completed
              </button>
              {showDone && done.map(t => <TaskRow key={t.id} task={t} projs={projs} labels={labels} onToggle={() => togT(t.id)} onEdit={() => setEditT(t)} onDelete={() => delT(t.id)} />)}
            </div>
          )}
        </div>
      </main>

      {showAdd && <TaskModal title="New Task" task={null} projs={projs} labels={labels} onSave={t => { addT(t); setShowAdd(false) }} onClose={() => setShowAdd(false)} />}
      {editT   && <TaskModal title="Edit Task" task={editT} projs={projs} labels={labels} onSave={t => { updT(editT.id, t); setEditT(null) }} onClose={() => setEditT(null)} />}
      {showSrch && <SearchModal tasks={tasks} projs={projs} onSelect={t => { setEditT(t); setShowSrch(false) }} onClose={() => setShowSrch(false)} />}
      {showAP  && <MiniModal title="New Project" onClose={() => setShowAP(false)} onSave={d => { addProj(d); setShowAP(false) }} colors={COLORS} />}
      {showAL  && <MiniModal title="New Label"   onClose={() => setShowAL(false)} onSave={d => { addLabel(d); setShowAL(false) }} colors={COLORS} />}
      {showCL  && <CLModal onClose={() => setShowCL(false)} />}

      <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 900 }}>
        {!showChat && (
          <button onClick={() => setShowChat(true)} title="AI Assistant"
            style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#4a90d9,#7c5cf6)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 28px rgba(74,144,217,.45)' }}>
            <I n="bot" s={22} />
          </button>
        )}
        {showChat && <ChatPanel tasks={tasks} projs={projs} labels={labels} onAddTask={addT} onClose={() => setShowChat(false)} />}
      </div>
    </div>
  )
}

// ─── TaskRow ──────────────────────────────────────────────────────────────────
function TaskRow({ task, projs, labels, onToggle, onEdit, onDelete }) {
  const p    = PRI[task.priority] || PRI[4]
  const proj = projs.find(pr => pr.id === task.projectId)
  const tls  = labels.filter(l => task.labels?.includes(l.id))
  const doneSubs = task.subtasks?.filter(s => s.done).length || 0
  const totSubs  = task.subtasks?.length || 0
  return (
    <div className="tr fi">
      <button onClick={onToggle} style={{ width: 17, height: 17, borderRadius: '50%', border: `2px solid ${p.c}`, background: task.completed ? p.c : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 3, color: 'white', padding: 0 }}>
        {task.completed && <I n="chk" s={9} />}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13.5, color: task.completed ? '#b0bec9' : '#1a202c', textDecoration: task.completed ? 'line-through' : 'none', fontWeight: task.completed ? 400 : 500 }}>{task.title}</span>
          {task.priority <= 2 && <span className="tag" style={{ background: p.b, color: p.c }}>{p.l}</span>}
          {task.recurrence && <span style={{ fontSize: 11, color: '#94a3b8' }}>↻ {task.recurrence}</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3, flexWrap: 'wrap' }}>
          {task.due && (
            <span style={{ fontSize: 11.5, color: isOv(task.due) && !task.completed ? '#e05252' : isTd(task.due) ? '#e8832a' : '#94a3b8', display: 'flex', alignItems: 'center', gap: 3 }}>
              <I n="today" s={10} />
              {isOv(task.due) && !task.completed ? `Overdue · ${fmtD(task.due)}` : isTd(task.due) ? 'Today' : isTm(task.due) ? 'Tomorrow' : fmtD(task.due)}
            </span>
          )}
          {proj && proj.id !== 'inbox' && (
            <span style={{ fontSize: 11.5, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: proj.color, display: 'inline-block' }} />
              {proj.name}
            </span>
          )}
          {tls.map(l => <span key={l.id} className="tag" style={{ background: l.color + '18', color: l.color }}>@{l.name}</span>)}
          {totSubs > 0 && <span style={{ fontSize: 11.5, color: '#94a3b8' }}>{doneSubs}/{totSubs}</span>}
          {task.reminder && <span style={{ fontSize: 11.5, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 2 }}><I n="bell" s={10} />{fmtD(task.reminder)}</span>}
        </div>
        {task.notes && <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>{task.notes}</div>}
      </div>
      <div className="ta" style={{ display: 'flex', gap: 1, opacity: 0, transition: 'opacity .12s', flexShrink: 0 }}>
        <button onClick={onEdit}   style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 5, borderRadius: 6, color: '#94a3b8', display: 'flex' }}><I n="edit"  s={13} /></button>
        <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 5, borderRadius: 6, color: '#94a3b8', display: 'flex' }}><I n="trash" s={13} /></button>
      </div>
    </div>
  )
}

// ─── TaskModal ────────────────────────────────────────────────────────────────
function TaskModal({ title, task, projs, labels, onSave, onClose }) {
  const [form, setForm] = useState({
    title: task?.title || '', notes: task?.notes || '', due: task?.due || '',
    priority: task?.priority || 4, projectId: task?.projectId || 'inbox',
    labels: task?.labels || [], reminder: task?.reminder || '',
    recurrence: task?.recurrence || '', subtasks: task?.subtasks || [],
  })
  const [ns, setNs] = useState('')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const togL = id => set('labels', form.labels.includes(id) ? form.labels.filter(l => l !== id) : [...form.labels, id])
  const addSub = () => { if (ns.trim()) { set('subtasks', [...form.subtasks, { id: uid(), title: ns.trim(), done: false }]); setNs('') } }
  return (
    <div className="ov" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mo fi">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <h2 style={{ fontSize: 17, fontWeight: 500 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', padding: 3 }}><I n="x" s={17} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          <input className="inp" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Task title *" style={{ fontSize: 14.5, fontWeight: 500 }} autoFocus />
          <textarea className="inp" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Add notes or description…" rows={2} style={{ resize: 'vertical' }} />
          <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 120 }}><label className="lbl">Due date</label><input type="date" className="cb" value={form.due} onChange={e => set('due', e.target.value)} /></div>
            <div style={{ flex: 1, minWidth: 100 }}><label className="lbl">Priority</label>
              <select className="cb" value={form.priority} onChange={e => set('priority', +e.target.value)}>
                {Object.entries(PRI).map(([k, v]) => <option key={k} value={k}>{v.l} — {k === '1' ? 'Critical' : k === '2' ? 'High' : k === '3' ? 'Medium' : 'Low'}</option>)}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 100 }}><label className="lbl">Project</label>
              <select className="cb" value={form.projectId} onChange={e => set('projectId', e.target.value)}>
                {projs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 120 }}><label className="lbl">Reminder</label><input type="date" className="cb" value={form.reminder} onChange={e => set('reminder', e.target.value)} /></div>
            <div style={{ flex: 1, minWidth: 120 }}><label className="lbl">Recurrence</label>
              <select className="cb" value={form.recurrence} onChange={e => set('recurrence', e.target.value)}>
                <option value="">No recurrence</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Every 2 weeks</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
          <div>
            <label className="lbl">Labels</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {labels.map(l => (
                <button key={l.id} className={`chip ${form.labels.includes(l.id) ? 'on' : ''}`}
                  style={form.labels.includes(l.id) ? { borderColor: l.color, color: l.color, background: l.color + '14' } : {}}
                  onClick={() => togL(l.id)}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: l.color, display: 'inline-block' }} />{l.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="lbl">Subtasks</label>
            {form.subtasks.map((s, i) => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                <input type="checkbox" checked={s.done} onChange={() => set('subtasks', form.subtasks.map((x, j) => i === j ? { ...x, done: !x.done } : x))} />
                <span style={{ fontSize: 13, flex: 1, textDecoration: s.done ? 'line-through' : 'none', color: s.done ? '#b0bec9' : '#374151' }}>{s.title}</span>
                <button onClick={() => set('subtasks', form.subtasks.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b0bec9', display: 'flex' }}><I n="x" s={11} /></button>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 6 }}>
              <input className="inp" value={ns} onChange={e => setNs(e.target.value)} placeholder="Add subtask…" onKeyDown={e => e.key === 'Enter' && addSub()} style={{ fontSize: 13 }} />
              <button className="bg" onClick={addSub}>Add</button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 9, marginTop: 4 }}>
            <button className="bg" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
            <button className="bp" onClick={() => form.title.trim() && onSave(form)} style={{ flex: 2, justifyContent: 'center' }}>{task ? 'Save changes' : 'Add task'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── SearchModal ──────────────────────────────────────────────────────────────
function SearchModal({ tasks, projs, onSelect, onClose }) {
  const [q, setQ] = useState('')
  const r = q.length > 1 ? tasks.filter(t => t.title.toLowerCase().includes(q.toLowerCase()) || t.notes?.toLowerCase().includes(q.toLowerCase())).slice(0, 10) : []
  return (
    <div className="ov" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mo fi" style={{ padding: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1.5px solid #e2e8f0', borderRadius: 9, padding: '9px 13px', marginBottom: 6 }}>
          <I n="srch" s={15} />
          <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search tasks…"
            style={{ border: 'none', outline: 'none', flex: 1, fontSize: 14.5, fontFamily: 'Roboto, sans-serif' }} />
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}><I n="x" s={14} /></button>
        </div>
        {r.map(t => {
          const p = PRI[t.priority] || PRI[4]
          const proj = projs.find(pr => pr.id === t.projectId)
          return (
            <button key={t.id} onClick={() => onSelect(t)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 11px', borderRadius: 7, border: 'none', cursor: 'pointer', background: 'transparent', textAlign: 'left', fontFamily: 'Roboto, sans-serif' }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${p.c}`, flexShrink: 0 }} />
              <span style={{ fontSize: 13.5, flex: 1, color: '#1a202c' }}>{t.title}</span>
              {proj && <span style={{ fontSize: 12, color: '#94a3b8', whiteSpace: 'nowrap' }}>{proj.name}</span>}
              {t.due && <span style={{ fontSize: 12, color: '#94a3b8', whiteSpace: 'nowrap' }}>{fmtD(t.due)}</span>}
            </button>
          )
        })}
        {q.length > 1 && r.length === 0 && <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px 0', fontSize: 13.5 }}>No tasks found</div>}
      </div>
    </div>
  )
}

// ─── MiniModal ────────────────────────────────────────────────────────────────
function MiniModal({ title, onSave, onClose, colors }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(colors[0])
  return (
    <div className="ov" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mo fi" style={{ maxWidth: 340 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 500 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}><I n="x" s={16} /></button>
        </div>
        <label className="lbl">Name</label>
        <input className="inp" value={name} onChange={e => setName(e.target.value)} placeholder="Name" autoFocus style={{ marginBottom: 13 }} />
        <label className="lbl">Color</label>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 16 }}>
          {colors.map(c => <button key={c} onClick={() => setColor(c)} style={{ width: 24, height: 24, borderRadius: '50%', background: c, border: color === c ? '3px solid #1a202c' : '3px solid transparent', cursor: 'pointer', padding: 0 }} />)}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="bg" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
          <button className="bp" onClick={() => name.trim() && onSave({ name: name.trim(), color })} style={{ flex: 2, justifyContent: 'center' }}>Create</button>
        </div>
      </div>
    </div>
  )
}

// ─── CLModal ──────────────────────────────────────────────────────────────────
function CLModal({ onClose }) {
  const changelog = [
    { version: '1.0.1', date: new Date().toISOString(), changes: ['Rebranded to Taskly', 'Font updated to Roboto', 'Supabase backend integration', 'Full project structure for GitHub'] },
    { version: '1.0.0', date: new Date(Date.now() - 86400000).toISOString(), changes: ['Initial release', 'Projects, labels, filters, priorities', 'Subtasks, reminders, recurrence', 'AI assistant powered by Claude', 'Search, sort, changelog'] },
  ]
  return (
    <div className="ov" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mo fi" style={{ maxWidth: 440 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 500 }}>Changelog</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}><I n="x" s={16} /></button>
        </div>
        {changelog.map((entry, i) => (
          <div key={i} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: i < changelog.length - 1 ? '1px solid #f0f2f8' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
              <span style={{ background: 'linear-gradient(135deg,#4a90d9,#7c5cf6)', color: 'white', fontSize: 11, fontWeight: 500, padding: '2px 9px', borderRadius: 100 }}>{entry.version}</span>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>{new Date(entry.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {entry.changes.map((c, j) => (
                <li key={j} style={{ fontSize: 13, color: '#374151', display: 'flex', alignItems: 'flex-start', gap: 7, marginBottom: 4 }}>
                  <span style={{ color: '#4a90d9', marginTop: 1 }}>✓</span>{c}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── ChatPanel ────────────────────────────────────────────────────────────────
function ChatPanel({ tasks, projs, labels, onAddTask, onClose }) {
  const [msgs,    setMsgs]    = useState([{ role: 'ai', text: "Hi! I'm your Taskly AI. I can add tasks, analyze your workload, suggest priorities, and help you stay productive. What would you like to do?" }])
  const [input,   setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef()
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  const sugg = ["What's due today?", "Add a P1 task for me", "Help me prioritize", "Show overdue tasks"]

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim(); setInput(''); setLoading(true)
    setMsgs(m => [...m, { role: 'user', text: userMsg }])

    const sys = `You are Taskly AI, an assistant inside a task manager called Taskly.
Today: ${new Date().toDateString()}
Tasks (${tasks.filter(t => !t.completed).length} active):
${tasks.filter(t => !t.completed).slice(0, 20).map(t => `- "${t.title}" due:${t.due || 'none'} P${t.priority} proj:${t.projectId}`).join('\n')}
Overdue: ${tasks.filter(t => isOv(t.due) && !t.completed).length}
Projects: ${projs.map(p => p.name).join(', ')}
Labels: ${labels.map(l => l.name).join(', ')}
When adding a task respond ONLY with JSON: {"action":"add","task":{"title":"...","due":"YYYY-MM-DD","priority":1-4,"projectId":"inbox","labels":[],"notes":""},"message":"confirmation"}
For other questions, respond naturally. Be concise.`

    const hist = msgs.slice(-8).map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text }))
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 800, system: sys, messages: [...hist, { role: 'user', content: userMsg }] })
      })
      const data = await res.json()
      const raw = data.content?.[0]?.text || 'Sorry, I had trouble with that.'
      try {
        const m = raw.match(/\{[\s\S]*?"action"[\s\S]*?\}/)
        if (m) {
          const parsed = JSON.parse(m[0])
          if (parsed.action === 'add' && parsed.task?.title) {
            onAddTask(parsed.task)
            setMsgs(ms => [...ms, { role: 'ai', text: parsed.message || `✅ Added: "${parsed.task.title}"` }])
          } else { setMsgs(ms => [...ms, { role: 'ai', text: raw.replace(/\{[\s\S]*?\}/, '').trim() || 'Done!' }]) }
        } else { setMsgs(ms => [...ms, { role: 'ai', text: raw }]) }
      } catch { setMsgs(ms => [...ms, { role: 'ai', text: raw }]) }
    } catch { setMsgs(ms => [...ms, { role: 'ai', text: '⚠️ Connection issue. Please try again.' }]) }
    setLoading(false)
  }

  return (
    <div className="fi" style={{ width: 356, height: 520, background: 'white', borderRadius: 17, boxShadow: '0 20px 60px rgba(0,0,0,.15)', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1.5px solid #e8edf5' }}>
      <div style={{ padding: '13px 15px', background: 'linear-gradient(135deg,#4a90d9,#7c5cf6)', display: 'flex', alignItems: 'center', gap: 9 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(255,255,255,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><I n="bot" s={17} /></div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13.5, fontWeight: 500, color: 'white' }}>Taskly AI</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.7)' }}>Powered by Claude · {tasks.filter(t => !t.completed).length} tasks</div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.8)', display: 'flex', padding: 3 }}><I n="x" s={15} /></button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 9, background: '#fafbff' }}>
        {msgs.map((m, i) => <div key={i} className={`bubble ${m.role === 'user' ? 'buser' : 'bai'}`} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start' }}>{m.text}</div>)}
        {loading && <div className="bubble bai pl" style={{ alignSelf: 'flex-start', color: '#94a3b8' }}>Thinking…</div>}
        <div ref={endRef} />
      </div>
      {msgs.length <= 2 && (
        <div style={{ padding: '4px 12px 8px', display: 'flex', gap: 5, flexWrap: 'wrap', background: '#fafbff' }}>
          {sugg.map(s => <button key={s} className="chip" style={{ fontSize: 11 }} onClick={() => setInput(s)}>{s}</button>)}
        </div>
      )}
      <div style={{ padding: '9px 12px', borderTop: '1.5px solid #eaedf5', display: 'flex', gap: 7, background: 'white' }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Ask anything…"
          style={{ flex: 1, padding: '8px 13px', border: '1.5px solid #e2e8f0', borderRadius: 20, fontSize: 13, outline: 'none', fontFamily: 'Roboto, sans-serif', background: '#fafbff' }} />
        <button onClick={send} disabled={!input.trim() || loading}
          style={{ width: 36, height: 36, borderRadius: '50%', background: input.trim() ? 'linear-gradient(135deg,#4a90d9,#7c5cf6)' : '#e8edf5', border: 'none', cursor: input.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
          <I n="send" s={13} />
        </button>
      </div>
    </div>
  )
}
