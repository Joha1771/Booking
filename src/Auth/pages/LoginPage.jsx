import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    border: '1px solid #ccc',
    borderRadius: 4,
    fontSize: 15,
    outline: 'none',
    boxSizing: 'border-box',
  }

  const handleSubmit = () => {
    if (!email || !password) { setError('Заполните все поля'); return }
    navigate('/profile')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#003580', display: 'flex', flexDirection: 'column' }}>
      {/* Logo */}
      <div style={{ padding: '24px 0', textAlign: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <span style={{ color: '#fff', fontSize: 28, fontWeight: 900, fontFamily: 'Georgia, serif' }}>
            Booking.com
          </span>
        </Link>
      </div>

      {/* Card */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px 40px' }}>
        <div style={{ background: '#fff', borderRadius: 8, padding: 32, width: '100%', maxWidth: 420, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, color: '#1a1a1a' }}>Войти или создать аккаунт</h1>
          <p style={{ fontSize: 14, color: '#555', marginBottom: 24 }}>Одного аккаунта достаточно для всех сервисов Booking.com</p>

          {error && (
            <div style={{ background: '#fff0f0', border: '1px solid #ffcdd2', borderRadius: 4, padding: '10px 14px', fontSize: 13, color: '#c00', marginBottom: 16 }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Email</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                style={{ ...inputStyle, paddingLeft: 40 }}
              />
              <Mail size={16} color="#888" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Пароль</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Введите пароль"
                style={{ ...inputStyle, paddingLeft: 40, paddingRight: 40 }}
              />
              <Lock size={16} color="#888" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <button onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
                {showPass ? <EyeOff size={16} color="#888" /> : <Eye size={16} color="#888" />}
              </button>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            style={{
              width: '100%',
              background: 'var(--booking-blue-light)',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              padding: '14px',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              marginBottom: 16,
            }}
          >
            Войти
          </button>

          <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--booking-blue-light)', marginBottom: 20, cursor: 'pointer' }}>
            Забыли пароль?
          </div>

          <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: 20 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <button style={{
                flex: 1,
                border: '1px solid #ccc',
                borderRadius: 4,
                padding: '10px',
                fontSize: 14,
                cursor: 'pointer',
                background: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}>
                <img src="https://www.google.com/favicon.ico" width={18} height={18} alt="Google" />
                Google
              </button>
              <button style={{
                flex: 1,
                border: '1px solid #ccc',
                borderRadius: 4,
                padding: '10px',
                fontSize: 14,
                cursor: 'pointer',
                background: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}>
                <span style={{ fontSize: 18 }}>📘</span>
                Facebook
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14 }}>
            Нет аккаунта?{' '}
            <Link to="/register" style={{ color: 'var(--booking-blue-light)', fontWeight: 600, textDecoration: 'none' }}>
              Создать аккаунт
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
