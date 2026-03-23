import { useState } from 'react'
import api from '../../services/api.js'

const COLORS  = ['#6366F1','#EF4444','#F59E0B','#10B981','#3B82F6','#8B5CF6','#EC4899','#14B8A6']
const ICONS   = ['📋','🚀','💡','🎯','🔧','🎨','📊','🏆','⚡','🌟']

export default function EditProjectModal({ project, onClose, onUpdated }) {
  const [form, setForm] = useState({
    name:        project.name,
    description: project.description || '',
    color:       project.color || '#6366F1',
    icon:        project.icon || '📋',
    visibility:  project.visibility || 'PRIVADO',
    status:      project.status || 'ACTIVO',
    endDate:     project.endDate ? project.endDate.split('T')[0] : '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleChange = e => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.put(`/projects/${project._id}`, form)
      onUpdated(data.project)
    } catch(err) {
      setError(err.response?.data?.message || 'Error al actualizar el proyecto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 style={{ fontSize:18, fontWeight:700 }}>Editar Proyecto</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Nombre del proyecto *</label>
              <input
                className="input"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Mi proyecto"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Descripción</label>
              <textarea
                className="textarea"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="¿De qué trata este proyecto?"
                style={{ minHeight: 70 }}
              />
            </div>

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
                <label>Estado</label>
                <select className="select" name="status" value={form.status} onChange={handleChange}>
                  <option value="ACTIVO">Activo</option>
                  <option value="PAUSADO">Pausado</option>
                  <option value="COMPLETADO">Completado</option>
                  <option value="ARCHIVADO">Archivado</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Fecha límite</label>
                <input
                  className="input"
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Color</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                {COLORS.map(c => (
                  <div
                    key={c}
                    onClick={() => setForm(p => ({ ...p, color: c }))}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: c,
                      cursor: 'pointer',
                      outline: form.color === c ? `3px solid ${c}` : 'none',
                      outlineOffset: 2,
                      transition: 'all 0.1s',
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Ícono</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                {ICONS.map(ic => (
                  <div
                    key={ic}
                    onClick={() => setForm(p => ({ ...p, icon: ic }))}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18,
                      cursor: 'pointer',
                      background: form.icon === ic ? 'var(--accent-light)' : 'var(--bg-tertiary)',
                      border: form.icon === ic ? '2px solid var(--accent)' : '1px solid var(--border)',
                      transition: 'all 0.1s',
                    }}
                  >
                    {ic}
                  </div>
                ))}
              </div>
            </div>

            {error && <p className="error-msg">{error}</p>}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Actualizando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
