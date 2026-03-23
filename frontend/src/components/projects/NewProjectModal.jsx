import { useState } from 'react'
import api from '../../services/api.js'

const COLORS  = ['#6366F1','#EF4444','#F59E0B','#10B981','#3B82F6','#8B5CF6','#EC4899','#14B8A6']
const ICONS   = ['📋','🚀','💡','🎯','🔧','🎨','📊','🏆','⚡','🌟']
const TEMPLATES = [
  { id: 'custom',    label: 'Personalizado',  icon: '✏️',  desc: 'Configura tu propio proyecto' },
  { id: 'scrum',     label: 'Scrum',           icon: '🚀',  desc: 'Builder Director: columnas Scrum estándar' },
  { id: 'marketing', label: 'Marketing',       icon: '📣',  desc: 'Builder Director: flujo de campaña' },
  { id: 'personal',  label: 'Personal',        icon: '⭐',  desc: 'Builder Director: proyecto simple' },
]

export default function NewProjectModal({ onClose, onCreated }) {
  const [step, setStep] = useState('template') // template | form
  const [template, setTemplate] = useState(null)
  const [form, setForm] = useState({ name:'', description:'', color:'#6366F1', icon:'📋', visibility:'PRIVADO', endDate:'' })
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      let data
      if (template && template !== 'custom') {
        // Builder + Director en el backend
        const res = await api.post(`/projects/template/${template}`, {
          name: form.name,
          description: form.description,
          endDate: form.endDate || undefined,
        })
        data = res.data
      } else {
        // Builder fluido en el backend
        const res = await api.post('/projects', form)
        data = res.data
      }
      onCreated(data.project)
    } catch(err) {
      setError(err.response?.data?.message || 'Error al crear el proyecto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 style={{ fontSize:18, fontWeight:700 }}>Nuevo Proyecto</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        {step === 'template' ? (
          <div className="modal-body">
            <p style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:16 }}>
              Elige una plantilla o crea un proyecto personalizado.
              Las plantillas usan el <strong>Patrón Builder + Director</strong>.
            </p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {TEMPLATES.map(t => (
                <div
                  key={t.id}
                  onClick={() => { setTemplate(t.id); setStep('form') }}
                  style={{
                    padding:'16px', borderRadius:10, cursor:'pointer',
                    border: template === t.id ? '2px solid var(--accent)' : '1px solid var(--border)',
                    background: template === t.id ? 'var(--accent-light)' : 'var(--bg-tertiary)',
                    transition:'all 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor='var(--accent)'}
                  onMouseLeave={e => { if(template !== t.id) e.currentTarget.style.borderColor='var(--border)' }}
                >
                  <div style={{ fontSize:22, marginBottom:6 }}>{t.icon}</div>
                  <div style={{ fontWeight:600, fontSize:14, color:'var(--text-primary)' }}>{t.label}</div>
                  <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:3 }}>{t.desc}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {template && template !== 'custom' && (
                <div style={{ padding:'10px 14px', borderRadius:8, background:'var(--accent-light)',
                  color:'var(--accent)', fontSize:13, marginBottom:16, fontWeight:500 }}>
                  🔨 Usando Builder Director: plantilla <strong>{template}</strong>
                </div>
              )}

              <div className="form-group">
                <label>Nombre del proyecto *</label>
                <input className="input" name="name" value={form.name} onChange={handleChange} required placeholder="Mi proyecto" autoFocus />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea className="textarea" name="description" value={form.description} onChange={handleChange} placeholder="¿De qué trata este proyecto?" style={{ minHeight:70 }} />
              </div>

              {template === 'custom' && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Visibilidad</label>
                      <select className="select" name="visibility" value={form.visibility} onChange={handleChange}>
                        <option value="PRIVADO">Privado</option>
                        <option value="EQUIPO">Equipo</option>
                        <option value="PUBLICO">Público</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Fecha límite</label>
                      <input className="input" type="date" name="endDate" value={form.endDate} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Color</label>
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:4 }}>
                      {COLORS.map(c => (
                        <div key={c} onClick={() => setForm(p => ({...p, color:c}))}
                          style={{ width:28, height:28, borderRadius:'50%', background:c, cursor:'pointer',
                            outline: form.color===c ? `3px solid ${c}` : 'none',
                            outlineOffset:2, transition:'all 0.1s' }} />
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Ícono</label>
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:4 }}>
                      {ICONS.map(ic => (
                        <div key={ic} onClick={() => setForm(p => ({...p, icon:ic}))}
                          style={{ width:36, height:36, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center',
                            fontSize:18, cursor:'pointer', background: form.icon===ic ? 'var(--accent-light)' : 'var(--bg-tertiary)',
                            border: form.icon===ic ? '2px solid var(--accent)' : '1px solid var(--border)' }}>
                          {ic}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {template !== 'custom' && (
                <div className="form-group">
                  <label>Fecha límite (opcional)</label>
                  <input className="input" type="date" name="endDate" value={form.endDate} onChange={handleChange} />
                </div>
              )}

              {error && <p className="error-msg">{error}</p>}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setStep('template')}>← Atrás</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Creando...' : 'Crear proyecto'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
