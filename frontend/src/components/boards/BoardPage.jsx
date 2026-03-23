import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../services/api.js'
import TaskCard  from '../tasks/TaskCard.jsx'
import TaskModal from '../tasks/TaskModal.jsx'

export default function BoardPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [board, setBoard]           = useState(null)
  const [tasksByColumn, setTasksByColumn] = useState({})
  const [loading, setLoading]       = useState(true)
  const [showNewTask, setShowNewTask] = useState(false)
  const [activeColumn, setActiveColumn] = useState(null)
  const [editTask, setEditTask]     = useState(null)
  const [filter, setFilter]         = useState({ priority:'', type:'', search:'' })

  const load = async () => {
    try {
      const { data } = await api.get(`/boards/${id}`)
      setBoard(data.board)
      setTasksByColumn(data.tasksByColumn)
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [id])

  const handleTaskCreated = (task) => {
    setTasksByColumn(prev => {
      const updated = { ...prev }
      const col = task.column || board.columns[0]?.name
      if (!updated[col]) updated[col] = []
      updated[col] = [task, ...updated[col]]
      return updated
    })
    setShowNewTask(false)
  }

  const handleTaskDeleted = (taskId, column) => {
    setTasksByColumn(prev => ({
      ...prev,
      [column]: prev[column]?.filter(t => t._id !== taskId) || []
    }))
  }

  const handleTaskMoved = async (taskId, fromCol, toCol) => {
    try {
      await api.put(`/tasks/${taskId}/move`, { column: toCol })
      setTasksByColumn(prev => {
        const from = prev[fromCol]?.filter(t => t._id !== taskId) || []
        const task = prev[fromCol]?.find(t => t._id === taskId)
        const to   = task ? [{ ...task, column: toCol }, ...(prev[toCol] || [])] : (prev[toCol] || [])
        return { ...prev, [fromCol]: from, [toCol]: to }
      })
    } catch(e) { console.error(e) }
  }

  const handleCloneTask = async (task) => {
    const title = prompt('Nombre de la tarea clonada:', `Copia de ${task.title}`)
    if (!title) return
    try {
      const { data } = await api.post(`/tasks/${task._id}/clone`, { title })
      handleTaskCreated(data.task)
      alert(`✅ ${data.message}`)
    } catch(e) { alert('Error al clonar') }
  }

  const getFilteredTasks = (tasks) => {
    return tasks?.filter(t => {
      if (filter.priority && t.priority !== filter.priority) return false
      if (filter.type && t.type !== filter.type) return false
      if (filter.search && !t.title.toLowerCase().includes(filter.search.toLowerCase())) return false
      return true
    }) || []
  }

  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', color:'var(--text-muted)' }}>Cargando tablero...</div>
  if (!board)  return <div style={{ padding:24 }}>Tablero no encontrado</div>

  const projectId = board.projectId

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'calc(100vh - 56px)' }}>
      {/* Board header */}
      <div style={{ padding:'16px 24px', background:'var(--bg-secondary)', borderBottom:'1px solid var(--border)',
        display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:2, cursor:'pointer' }}
            onClick={() => navigate(`/projects/${projectId}`)}>
            ← Volver al proyecto
          </div>
          <h1 style={{ fontSize:18, fontWeight:700, color:'var(--text-primary)' }}>🗂 {board.name}</h1>
        </div>

        {/* Filters */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <input className="input" placeholder="🔍 Buscar..." style={{ width:180 }}
            value={filter.search} onChange={e => setFilter(p => ({...p, search:e.target.value}))} />
          <select className="select" style={{ width:120 }}
            value={filter.priority} onChange={e => setFilter(p => ({...p, priority:e.target.value}))}>
            <option value="">Prioridad</option>
            {['URGENTE','ALTA','MEDIA','BAJA'].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <select className="select" style={{ width:120 }}
            value={filter.type} onChange={e => setFilter(p => ({...p, type:e.target.value}))}>
            <option value="">Tipo</option>
            {['BUG','FEATURE','STORY','TASK'].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>

        <button className="btn btn-primary" onClick={() => { setActiveColumn(board.columns[0]?.name); setShowNewTask(true) }}>
          + Nueva tarea
        </button>
      </div>

      {/* Kanban columns */}
      <div style={{ flex:1, overflowX:'auto', padding:16, display:'flex', gap:14, alignItems:'flex-start' }}>
        {board.columns?.map(col => {
          const colTasks = getFilteredTasks(tasksByColumn[col.name])
          return (
            <div key={col._id} style={{
              minWidth:290, width:290, background:'var(--column-bg)',
              borderRadius:12, display:'flex', flexDirection:'column', maxHeight:'calc(100vh - 160px)',
            }}>
              {/* Column header */}
              <div style={{ padding:'12px 14px 10px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:col.color || 'var(--accent)' }} />
                  <span style={{ fontWeight:600, fontSize:13, color:'var(--text-primary)' }}>{col.name}</span>
                  <span style={{ fontSize:12, color:'var(--text-muted)', background:'var(--bg-secondary)',
                    borderRadius:10, padding:'1px 7px', border:'1px solid var(--border)' }}>
                    {colTasks.length}
                  </span>
                </div>
                <button className="btn btn-ghost btn-icon" style={{ fontSize:14, padding:'4px 6px' }}
                  onClick={() => { setActiveColumn(col.name); setShowNewTask(true) }}>
                  +
                </button>
              </div>

              {/* Tasks */}
              <div style={{ flex:1, overflowY:'auto', padding:'0 10px 12px', display:'flex', flexDirection:'column', gap:8 }}>
                {colTasks.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'24px 0', color:'var(--text-muted)', fontSize:12 }}>
                    Sin tareas
                  </div>
                ) : (
                  colTasks.map(task => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      columns={board.columns}
                      onMove={handleTaskMoved}
                      onDelete={handleTaskDeleted}
                      onClone={handleCloneTask}
                      onClick={() => setEditTask(task)}
                    />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* New / Edit task modal */}
      {showNewTask && (
        <TaskModal
          boardId={id}
          projectId={projectId}
          defaultColumn={activeColumn}
          columns={board.columns}
          onClose={() => setShowNewTask(false)}
          onSaved={handleTaskCreated}
        />
      )}

      {editTask && (
        <TaskModal
          task={editTask}
          boardId={id}
          projectId={projectId}
          columns={board.columns}
          onClose={() => setEditTask(null)}
          onSaved={(updated) => {
            setTasksByColumn(prev => {
              const updated2 = {}
              for (const col in prev) {
                updated2[col] = prev[col].map(t => t._id === updated._id ? updated : t)
              }
              return updated2
            })
            setEditTask(null)
          }}
        />
      )}
    </div>
  )
}
