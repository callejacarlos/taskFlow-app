import { useState } from 'react'
import api from '../../services/api.js'

const PRIORITY_COLOR = {
  URGENTE: { bg:'#FEE2E2', color:'#991B1B', dot:'#EF4444' },
  ALTA:    { bg:'#FFEDD5', color:'#9A3412', dot:'#F97316' },
  MEDIA:   { bg:'#FEF3C7', color:'#92400E', dot:'#F59E0B' },
  BAJA:    { bg:'#DBEAFE', color:'#1E40AF', dot:'#3B82F6' },
}
const TYPE_ICON = { BUG:'🐛', FEATURE:'✨', STORY:'📖', TASK:'📌' }

export default function TaskCard({ task, columns, onMove, onDelete, onClone, onClick }) {
  const [showMenu, setShowMenu] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const pStyle = PRIORITY_COLOR[task.priority] || PRIORITY_COLOR.MEDIA

  const subtaskDone  = task.subtasks?.filter(s => s.completed).length || 0
  const subtaskTotal = task.subtasks?.length || 0
  const progress     = subtaskTotal ? Math.round(subtaskDone / subtaskTotal * 100) : 0

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE'

  const handleDelete = async e => {
    e.stopPropagation()
    if (!confirm('¿Eliminar esta tarea?')) return
    setDeleting(true)
    try {
      await api.delete(`/tasks/${task._id}`)
      onDelete(task._id, task.column)
    } catch(e) { console.error(e) }
    finally { setDeleting(false) }
  }

  const otherColumns = columns?.filter(c => c.name !== task.column) || []

  return (
    <div
      onClick={() => onClick(task)}
      style={{
        background:'var(--card-bg)',
        border: isOverdue ? '1px solid var(--error)' : '1px solid var(--border)',
        borderRadius:10,
        padding:'12px 12px 10px',
        cursor:'pointer',
        position:'relative',
        transition:'box-shadow 0.15s, transform 0.1s',
        boxShadow:'var(--shadow-sm)',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow='var(--shadow-md)'; e.currentTarget.style.transform='translateY(-1px)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow='var(--shadow-sm)'; e.currentTarget.style.transform='' }}
    >
      {/* Type + Priority row */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
        <div style={{ display:'flex', gap:5 }}>
          <span style={{ fontSize:12 }}>{TYPE_ICON[task.type] || '📌'}</span>
          <span style={{ fontSize:11, fontWeight:600, background:pStyle.bg, color:pStyle.color,
            padding:'2px 7px', borderRadius:5, letterSpacing:'0.02em' }}>
            {task.priority}
          </span>
        </div>
        {/* Actions menu */}
        <div style={{ position:'relative' }} onClick={e => e.stopPropagation()}>
          <button className="btn btn-ghost btn-icon" style={{ padding:'2px 5px', fontSize:14 }}
            onClick={() => setShowMenu(v => !v)}>
            ⋮
          </button>
          {showMenu && (
            <div style={{
              position:'absolute', right:0, top:'100%', zIndex:200,
              background:'var(--bg-secondary)', border:'1px solid var(--border)',
              borderRadius:8, padding:4, minWidth:160, boxShadow:'var(--shadow-lg)'
            }} onMouseLeave={() => setShowMenu(false)}>
              <button className="btn btn-ghost btn-sm" style={{ width:'100%', justifyContent:'flex-start' }}
                onClick={() => { onClick(task); setShowMenu(false) }}>
                ✏️ Editar
              </button>
              <hr className="divider" style={{ margin:'4px 0' }} />
              {/* Move to column */}
              {otherColumns.map(col => (
                <button key={col._id} className="btn btn-ghost btn-sm" style={{ width:'100%', justifyContent:'flex-start', fontSize:12 }}
                  onClick={() => { onMove(task._id, task.column, col.name); setShowMenu(false) }}>
                  → {col.name}
                </button>
              ))}
              <hr className="divider" style={{ margin:'4px 0' }} />
              <button className="btn btn-ghost btn-sm" style={{ width:'100%', justifyContent:'flex-start' }}
                onClick={() => { onClone(task); setShowMenu(false) }}>
                📋 Clonar
              </button>
              <button className="btn btn-ghost btn-sm" style={{ width:'100%', justifyContent:'flex-start', color:'var(--error)' }}
                onClick={handleDelete} disabled={deleting}>
                🗑 Eliminar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <p style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', marginBottom:6, lineHeight:1.4,
        overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
        {task.title}
      </p>

      {/* Labels */}
      {task.labels?.length > 0 && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:3, marginBottom:6 }}>
          {task.labels.slice(0,3).map((l, i) => (
            <span key={i} style={{ fontSize:10, padding:'1px 6px', borderRadius:4, fontWeight:600,
              background:l.color+'22', color:l.color, border:`1px solid ${l.color}44` }}>
              {l.name}
            </span>
          ))}
        </div>
      )}

      {/* Subtask progress */}
      {subtaskTotal > 0 && (
        <div style={{ marginBottom:8 }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'var(--text-muted)', marginBottom:3 }}>
            <span>Subtareas</span>
            <span>{subtaskDone}/{subtaskTotal}</span>
          </div>
          <div style={{ height:3, borderRadius:2, background:'var(--bg-tertiary)' }}>
            <div style={{ width:`${progress}%`, height:'100%', borderRadius:2, background:'var(--success)', transition:'width 0.3s' }} />
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:11, color:'var(--text-muted)' }}>
        {task.assignedTo ? (
          <div style={{ display:'flex', alignItems:'center', gap:5 }}>
            <div className="avatar avatar-sm" style={{ width:18, height:18, fontSize:8 }}>
              {task.assignedTo.name?.[0]}
            </div>
            <span style={{ fontSize:11 }}>{task.assignedTo.name?.split(' ')[0]}</span>
          </div>
        ) : <span />}

        {task.dueDate && (
          <span style={{ color: isOverdue ? 'var(--error)' : 'var(--text-muted)' }}>
            {isOverdue ? '⚠️ ' : '📅 '}
            {new Date(task.dueDate).toLocaleDateString('es-CO', { month:'short', day:'numeric' })}
          </span>
        )}
      </div>
    </div>
  )
}
