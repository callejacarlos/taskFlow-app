import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../services/api.js'
import EditProjectModal from './EditProjectModal.jsx'

export default function ProjectPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [boards, setBoards]   = useState([])
  const [stats, setStats]     = useState({})
  const [loading, setLoading] = useState(true)
  const [showNewBoard, setShowNewBoard] = useState(false)
  const [newBoardName, setNewBoardName] = useState('')
  const [creating, setCreating] = useState(false)
  const [editingProject, setEditingProject] = useState(false)
  const [deletingProject, setDeletingProject] = useState(false)

  const load = async () => {
    try {
      const { data } = await api.get(`/projects/${id}`)
      setProject(data.project)
      setBoards(data.boards)
      setStats(data.stats)
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [id])

  const handleCreateBoard = async e => {
    e.preventDefault()
    if (!newBoardName.trim()) return
    setCreating(true)
    try {
      const { data } = await api.post('/boards', {
        name: newBoardName,
        projectId: id,
        columns: ['TODO', 'EN PROGRESO', 'EN REVISIÓN', 'HECHO'],
      })
      setBoards(p => [...p, data.board])
      setNewBoardName('')
      setShowNewBoard(false)
    } catch(e) { console.error(e) }
    finally { setCreating(false) }
  }

  const handleCloneBoard = async (boardId, boardName) => {
    const name = prompt(`Nombre del tablero clonado:`, `Copia de ${boardName}`)
    if (!name) return
    try {
      const { data } = await api.post(`/boards/${boardId}/clone`, { name })
      setBoards(p => [...p, data.board])
      alert(`✅ ${data.message}`)
    } catch(e) { alert('Error al clonar') }
  }

  const handleDeleteProject = async () => {
    if (!confirm('¿Eliminar este proyecto? Se eliminarán todos sus tableros y tareas.')) return
    setDeletingProject(true)
    try {
      await api.delete(`/projects/${id}`)
      alert('✅ Proyecto eliminado')
      navigate('/')
    } catch(err) {
      alert('Error al eliminar el proyecto')
      setDeletingProject(false)
    }
  }

  const handleProjectUpdated = (updatedProject) => {
    setProject(updatedProject)
    setEditingProject(false)
  }

  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', color:'var(--text-muted)' }}>Cargando...</div>
  if (!project) return <div style={{ padding:24 }}>Proyecto no encontrado</div>

  return (
    <div style={{ maxWidth:1100, margin:'0 auto', padding:24 }}>
      {/* Breadcrumb */}
      <div style={{ fontSize:13, color:'var(--text-muted)', marginBottom:16 }}>
        <span style={{ cursor:'pointer', color:'var(--accent)' }} onClick={() => navigate('/')}>Proyectos</span>
        {' / '}
        <span>{project.name}</span>
      </div>

      {/* Project header */}
      <div className="card" style={{ padding:24, marginBottom:24 }}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:16 }}>
          <div style={{ width:52, height:52, borderRadius:12, background:project.color,
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, flexShrink:0 }}>
            {project.icon}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
              <h1 style={{ fontSize:22, fontWeight:700, color:'var(--text-primary)' }}>{project.name}</h1>
              <span style={{ fontSize:11, padding:'3px 8px', borderRadius:6, fontWeight:600,
                background:'var(--success-light)', color:'var(--success)' }}>{project.status}</span>
            </div>
            {project.description && (
              <p style={{ color:'var(--text-secondary)', fontSize:14, marginBottom:12 }}>{project.description}</p>
            )}
            <div style={{ display:'flex', gap:20, fontSize:13, color:'var(--text-muted)' }}>
              <span>📋 {boards.length} tablero{boards.length!==1?'s':''}</span>
              <span>✅ {stats.doneTasks}/{stats.totalTasks} tareas</span>
              {project.endDate && <span>📅 {new Date(project.endDate).toLocaleDateString('es-CO')}</span>}
            </div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setEditingProject(true)}>
              ✏️ Editar
            </button>
            <button className="btn btn-danger btn-sm" onClick={handleDeleteProject} disabled={deletingProject} style={{ background:'var(--error)', color:'white', border:'none' }}>
              {deletingProject ? '...' : '🗑 Eliminar'}
            </button>
          </div>
          {/* Progress bar */}
          <div style={{ textAlign:'right', minWidth:80 }}>
            <div style={{ fontSize:22, fontWeight:700, color:'var(--accent)' }}>{stats.progress}%</div>
            <div style={{ fontSize:11, color:'var(--text-muted)' }}>completado</div>
            <div style={{ width:80, height:6, borderRadius:3, background:'var(--bg-tertiary)', marginTop:6 }}>
              <div style={{ width:`${stats.progress}%`, height:'100%', borderRadius:3, background:'var(--accent)', transition:'width 0.3s' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Tableros */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <h2 style={{ fontSize:18, fontWeight:600, color:'var(--text-primary)' }}>Tableros Kanban</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowNewBoard(true)}>+ Nuevo tablero</button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:12 }}>
        {boards.map(b => (
          <div key={b._id} className="card" style={{ padding:18 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
              <h3 style={{ fontSize:15, fontWeight:600, color:'var(--text-primary)' }}>🗂 {b.name}</h3>
            </div>
            <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:12 }}>
              {b.columns?.length || 0} columnas
            </p>
            <div style={{ display:'flex', gap:6 }}>
              <button className="btn btn-primary btn-sm" style={{ flex:1, justifyContent:'center' }}
                onClick={() => navigate(`/boards/${b._id}`)}>
                Abrir tablero
              </button>
              <button
                className="btn btn-secondary btn-sm"
                title="Clonar tablero (Prototype)"
                onClick={() => handleCloneBoard(b._id, b.name)}
              >
                📋 Clonar
              </button>
            </div>
          </div>
        ))}

        {/* New board inline form */}
        {showNewBoard && (
          <div className="card" style={{ padding:18 }}>
            <form onSubmit={handleCreateBoard}>
              <div className="form-group">
                <label style={{ fontSize:13 }}>Nombre del tablero</label>
                <input className="input" value={newBoardName} onChange={e => setNewBoardName(e.target.value)}
                  placeholder="Mi tablero" autoFocus />
              </div>
              <div style={{ display:'flex', gap:6 }}>
                <button type="submit" className="btn btn-primary btn-sm" disabled={creating} style={{ flex:1, justifyContent:'center' }}>
                  {creating ? '...' : 'Crear'}
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowNewBoard(false)}>✕</button>
              </div>
            </form>
          </div>
        )}
      </div>

      {boards.length === 0 && !showNewBoard && (
        <div className="empty-state">
          <div className="icon">🗂</div>
          <h3>Sin tableros</h3>
          <p>Crea un tablero Kanban para empezar a gestionar tareas</p>
          <button className="btn btn-primary" onClick={() => setShowNewBoard(true)}>Crear tablero</button>
        </div>
      )}

      {editingProject && project && (
        <EditProjectModal
          project={project}
          onClose={() => setEditingProject(false)}
          onUpdated={handleProjectUpdated}
        />
      )}
    </div>
  )
}
