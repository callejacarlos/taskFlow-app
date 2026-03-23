import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api.js'
import NewProjectModal from '../projects/NewProjectModal.jsx'
import EditProjectModal from '../projects/EditProjectModal.jsx'

const STATUS_COLOR = { ACTIVO:'var(--success)', PAUSADO:'var(--warning)', COMPLETADO:'var(--info)', ARCHIVADO:'var(--text-muted)' }

export default function DashboardPage() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [showMenu, setShowMenu] = useState(null) // ID del proyecto con menú abierto
  const navigate = useNavigate()

  const load = async () => {
    try {
      const { data } = await api.get('/projects')
      setProjects(data.projects)
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleCreated = (project) => {
    setProjects(p => [project, ...p])
    setShowModal(false)
  }

  const handleUpdated = (updatedProject) => {
    setProjects(p => p.map(proj => proj._id === updatedProject._id ? updatedProject : proj))
    setEditingProject(null)
  }

  const handleDelete = async (projectId, e) => {
    e.stopPropagation()
    if (!confirm('¿Eliminar este proyecto? Se eliminarán todos sus tableros y tareas.')) return
    try {
      await api.delete(`/projects/${projectId}`)
      setProjects(p => p.filter(proj => proj._id !== projectId))
      setShowMenu(null)
    } catch(err) {
      alert('Error al eliminar el proyecto')
    }
  }

  const handleClone = async (project, e) => {
    e.stopPropagation()
    // Usar el Prototype pattern para clonar tableros
    // Primero obtener los tableros del proyecto
    try {
      const { data } = await api.get(`/projects/${project._id}`)
      const boards = data.boards
      // Crear nuevo proyecto clonado
      const clonedName = `Copia de ${project.name}`
      const newProject = await api.post('/projects', {
        name: clonedName,
        description: project.description,
        color: project.color,
        icon: project.icon,
        visibility: project.visibility,
        endDate: project.endDate,
        tags: project.tags,
      })
      // Clonar cada tablero
      for (const board of boards) {
        await api.post(`/boards/${board._id}/clone`, {
          name: board.name,
        })
      }
      setProjects(p => [newProject.data.project, ...p])
      setShowMenu(null)
      alert('✅ Proyecto clonado exitosamente con todos sus tableros')
    } catch(err) {
      alert('Error al clonar el proyecto')
    }
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', color:'var(--text-muted)' }}>
      Cargando proyectos...
    </div>
  )

  return (
    <div style={{ maxWidth:1200, margin:'0 auto', padding:24 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:700, color:'var(--text-primary)' }}>Mis Proyectos</h1>
          <p style={{ color:'var(--text-secondary)', fontSize:14, marginTop:2 }}>
            {projects.length} proyecto{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Nuevo proyecto
        </button>
      </div>

      {/* Grid */}
      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📋</div>
          <h3>Sin proyectos aún</h3>
          <p>Crea tu primer proyecto para empezar a organizar tus tareas</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            Crear proyecto
          </button>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:16 }}>
          {projects.map(p => (
            <div
              key={p._id}
              className="card"
              onClick={() => navigate(`/projects/${p._id}`)}
              style={{ padding:20, cursor:'pointer', transition:'transform 0.15s, box-shadow 0.15s', position:'relative' }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='var(--shadow-md)' }}
              onMouseLeave={() => { if(showMenu !== p._id) setShowMenu(null) }}
            >
              {/* Top bar color */}
              <div style={{ height:4, borderRadius:'8px 8px 0 0', background:p.color, margin:'-20px -20px 16px', borderTopLeftRadius:12, borderTopRightRadius:12 }} />

              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:8 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, flex:1 }}>
                  <span style={{ fontSize:22 }}>{p.icon}</span>
                  <div>
                    <h3 style={{ fontSize:15, fontWeight:600, color:'var(--text-primary)' }}>{p.name}</h3>
                    <span style={{ fontSize:11, color: STATUS_COLOR[p.status] || 'var(--text-muted)', fontWeight:600 }}>
                      {p.status}
                    </span>
                  </div>
                </div>
                {/* Menú contextual */}
                <div style={{ position:'relative' }} onClick={e => e.stopPropagation()}>
                  <button className="btn btn-ghost btn-icon" style={{ padding:'2px 5px', fontSize:14 }}
                    onClick={() => setShowMenu(showMenu === p._id ? null : p._id)}>
                    ⋮
                  </button>
                  {showMenu === p._id && (
                    <div style={{
                      position:'absolute', right:0, top:'100%', zIndex:200,
                      background:'var(--bg-secondary)', border:'1px solid var(--border)',
                      borderRadius:8, padding:4, minWidth:160, boxShadow:'var(--shadow-lg)',
                      marginTop: 4
                    }} onMouseLeave={() => setShowMenu(null)}>
                      <button className="btn btn-ghost btn-sm" style={{ width:'100%', justifyContent:'flex-start' }}
                        onClick={e => { e.stopPropagation(); setEditingProject(p); setShowMenu(null) }}>
                        ✏️ Editar
                      </button>
                      <button className="btn btn-ghost btn-sm" style={{ width:'100%', justifyContent:'flex-start' }}
                        onClick={e => handleClone(p, e)}>
                        📋 Clonar
                      </button>
                      <hr className="divider" style={{ margin:'4px 0' }} />
                      <button className="btn btn-ghost btn-sm" style={{ width:'100%', justifyContent:'flex-start', color:'var(--error)' }}
                        onClick={e => handleDelete(p._id, e)}>
                        🗑 Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {p.description && (
                <p style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:12, lineHeight:1.5,
                  overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
                  {p.description}
                </p>
              )}

              {/* Tags */}
              {p.tags?.length > 0 && (
                <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:12 }}>
                  {p.tags.slice(0,3).map(tag => (
                    <span key={tag} style={{ fontSize:11, padding:'2px 8px', borderRadius:4,
                      background:'var(--accent-light)', color:'var(--accent)', fontWeight:500 }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:12, color:'var(--text-muted)' }}>
                <span>👤 {p.createdBy?.name}</span>
                {p.endDate && (
                  <span>📅 {new Date(p.endDate).toLocaleDateString('es-CO')}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <NewProjectModal onClose={() => setShowModal(false)} onCreated={handleCreated} />
      )}

      {editingProject && (
        <EditProjectModal
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  )
}
