import { Link, useNavigate } from 'react-router-dom'
import { useAuth }  from '../../context/AuthContext.jsx'
import { useTheme } from '../../context/ThemeContext.jsx'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { themeName, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login'); }

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2)
    : '?'

  return (
    <nav style={{
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border)',
      padding: '0 24px',
      height: '56px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: 'var(--shadow-sm)',
    }}>
      {/* Logo */}
      <Link to="/" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ fontSize:22 }}>⚡</span>
        <span style={{ fontWeight:700, fontSize:18, color:'var(--accent)', letterSpacing:'-0.5px' }}>
          TaskFlow
        </span>
      </Link>

      {/* Right side */}
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        {/* Theme toggle — ABSTRACT FACTORY en acción */}
        <button
          className="btn btn-ghost btn-icon"
          onClick={toggleTheme}
          title={`Cambiar a tema ${themeName === 'light' ? 'oscuro' : 'claro'}`}
        >
          {themeName === 'light' ? '🌙' : '☀️'}
        </button>

        {/* User info */}
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div className="avatar" style={{ fontSize:12 }}>{initials}</div>
          <div style={{ display:'flex', flexDirection:'column', lineHeight:1.2 }}>
            <span style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>{user?.name}</span>
            <span style={{ fontSize:11, color:'var(--text-muted)' }}>{user?.role}</span>
          </div>
        </div>

        <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
          Salir
        </button>
      </div>
    </nav>
  )
}
