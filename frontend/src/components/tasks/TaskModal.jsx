import { useState, useEffect } from 'react'
import api from '../../services/api.js'

const TYPES     = ['TASK','BUG','FEATURE','STORY']
const PRIOS     = ['BAJA','MEDIA','ALTA','URGENTE']
const TYPE_META = {
  BUG:     { icon:'🐛', color:'#EF4444', desc:'Registra un defecto o error' },
  FEATURE: { icon:'✨', color:'#8B5CF6', desc:'Nueva funcionalidad' },
  STORY:   { icon:'📖', color:'#F59E0B', desc:'Historia de usuario' },
  TASK:    { icon:'📌', color:'#3B82F6', desc:'Tarea general' },
}

export default function TaskModal({ task, boardId, projectId, defaultColumn, columns, onClose, onSaved }) {
  const isEdit = !!task

  const [form, setForm] = useState({
    title:       task?.title || '',
    description: task?.description || '',
    type:        task?.type || 'TASK',
    priority:    task?.priority || 'MEDIA',
    column:      task?.column || defaultColumn || columns?.[0]?.name || 'TODO',
    dueDate:     task?.dueDate ? task.dueDate.split('T')[0] : '',
    estimatedHours: task?.estimatedHours || 0,
  })
  const [subtasks, setSubtasks] = useState(task?.subtasks?.map(s => s.title) || [''])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [users, setUsers]       = useState([])
  const [assignedTo, setAssignedTo] = useState(task?.assignedTo?._id || '')
  const [activeTab, setActiveTab]   = useState('details')

  useEffect(() => {
    api.get('/auth/users').then(({ data }) => setUsers(data.users)).catch(() => {})
  }, [])

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubtaskChange = (i, val) => {
    setSubtasks(p => p.map((s, idx) => idx === i ? val : s))
  }
  const addSubtask    = () => setSubtasks(p => [...p, ''])
  const removeSubtask = i  => setSubtasks(p => p.filter((_, idx) => idx !== i))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = {
        ...form,
        boardId,
        projectId,
        assignedTo: assignedTo || null,
        subtasks: subtasks.filter(s => s.trim()).map(title => ({ title })),
        dueDate: form.dueDate || null,
      }

      let saved
      if (isEdit) {
        const { data } = await api.put(`/tasks/${task._id}`, payload)
        saved = data.task
      } else {
        // FACTORY METHOD: el backend selecciona el creator según payload.type
        const { data } = await api.post('/tasks', payload)
        saved = data.task
      }
      onSaved(saved)
    } catch(err) {
      setError(err.response?.data?.message || 'Error al guardar la tarea')
    } finally {
      setLoading(false)
    }
  }

  const meta = TYPE_META[form.type] || TYPE_META.TASK

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header" style={{ paddingBottom:0 }}>
          {/* Type selector visual */}
          <div style={{ display:'flex', gap:8 }}>
            {TYPES.map(t => {
              const m = TYPE_META[t]
              return (
                <button key={t}
                  type="button"
                  onClick={() => setForm(p => ({...p, type:t}))}
                  style={{
                    padding:'6px 12px', borderRadius:8, border:'none', cursor:'pointer', fontSize:12, fontWeight:600,
                    background: form.type===t ? m.color+'22' : 'var(--bg-tertiary)',
                    color: form.type===t ? m.color : 'var(--text-muted)',
                    outline: form.type===t ? `2px solid ${m.color}` : 'none',
                  }}>
                  {m.icon} {t}
                </button>
              )
            })}
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:0, borderBottom:'1px solid var(--border)', padding:'0 24px', marginTop:12 }}>
          {['details','subtasks'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ padding:'8px 16px', background:'transparent', border:'none', cursor:'pointer', fontSize:13, fontWeight:500,
                color: activeTab===tab ? 'var(--accent)' : 'var(--text-muted)',
                borderBottom: activeTab===tab ? '2px solid var(--accent)' : '2px solid transparent',
                marginBottom:-1 }}>
              {tab === 'details' ? '📋 Detalles' : `📝 Subtareas (${subtasks.filter(s=>s.trim()).length})`}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {activeTab === 'details' && (
              <>
                {!isEdit && (
                  <div style={{ padding:'8px 12px', borderRadius:8, background:meta.color+'11',
                    border:`1px solid ${meta.color}33`, marginBottom:14, fontSize:12, color:meta.color, fontWeight:500 }}>
                    🏭 Factory Method: Se usará <strong>{form.type}TaskCreator</strong> — {meta.desc}
                  </div>
                )}

                <div className="form-group">
                  <label>Título *</label>
                  <input className="input" name="title" value={form.title} onChange={handleChange} required autoFocus placeholder="Describe la tarea..." />
                </div>

                <div className="form-group">
                  <label>Descripción</label>
                  <textarea className="textarea" name="description" value={form.description} onChange={handleChange} placeholder="Más detalles sobre la tarea..." />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Prioridad</label>
                    <select className="select" name="priority" value={form.priority} onChange={handleChange}>
                      {PRIOS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Columna</label>
                    <select className="select" name="column" value={form.column} onChange={handleChange}>
                      {columns?.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Asignar a</label>
                    <select className="select" value={assignedTo} onChange={e => setAssignedTo(e.target.value)}>
                      <option value="">Sin asignar</option>
                      {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Fecha límite</label>
                    <input className="input" type="date" name="dueDate" value={form.dueDate} onChange={handleChange} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Estimación (horas)</label>
                  <input className="input" type="number" name="estimatedHours" value={form.estimatedHours}
                    onChange={handleChange} min={0} style={{ width:120 }} />
                </div>
              </>
            )}

            {activeTab === 'subtasks' && (
              <div>
                <p style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:14 }}>
                  Divide la tarea en pasos más pequeños.
                </p>
                {subtasks.map((s, i) => (
                  <div key={i} style={{ display:'flex', gap:6, marginBottom:8 }}>
                    <input className="input" value={s} onChange={e => handleSubtaskChange(i, e.target.value)}
                      placeholder={`Subtarea ${i+1}`} />
                    <button type="button" className="btn btn-ghost btn-icon" onClick={() => removeSubtask(i)}
                      style={{ flexShrink:0 }}>✕</button>
                  </div>
                ))}
                <button type="button" className="btn btn-secondary btn-sm" onClick={addSubtask} style={{ marginTop:4 }}>
                  + Agregar subtarea
                </button>
              </div>
            )}

            {error && <p className="error-msg" style={{ marginTop:10 }}>{error}</p>}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
