import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, User, Phone } from 'lucide-react'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

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
    if (!form.firstName || !form.email || !form.password) { setError('Заполните обязательные поля'); return }
    if (form.password !== form.confirm) { setError('Пароли не совпадают'); return }
    if (!agreed) { setError('Примите условия использования'); return }
    navigate('/profile')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#003580', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '24px 0', textAlign: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <span style={{ color: '#fff', fontSize: 28, fontWeight: 900, fontFamily: 'Georgia, serif' }}>
            Booking.com
          </span>
        </Link>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px 40px' }}>
        <div style={{ background: '#fff', borderRadius: 8, padding: 32, width: '100%', maxWidth: 460, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Создать аккаунт</h1>
          <p style={{ fontSize: 14, color: '#555', marginBottom: 24 }}>Присоединяйтесь к миллионам путешественников</p>

          {error && (
            <div style={{ background: '#fff0f0', border: '1px solid #ffcdd2', borderRadius: 4, padding: '10px 14px', fontSize: 13, color: '#c00', marginBottom: 16 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Имя *</label>
              <div style={{ position: 'relative' }}>
                <input value={form.firstName} onChange={e => update('firstName', e.target.value)} placeholder="Имя" style={{ ...inputStyle, paddingLeft: 38 }} />
                <User size={15} color="#888" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Фамилия</label>
              <input value={form.lastName} onChange={e => update('lastName', e.target.value)} placeholder="Фамилия" style={inputStyle} />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Email *</label>
            <div style={{ position: 'relative' }}>
              <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="name@example.com" style={{ ...inputStyle, paddingLeft: 38 }} />
              <Mail size={15} color="#888" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Телефон</label>
            <div style={{ position: 'relative' }}>
              <input value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+998 90 000 00 00" style={{ ...inputStyle, paddingLeft: 38 }} />
              <Phone size={15} color="#888" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Пароль *</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={e => update('password', e.target.value)}
                placeholder="Минимум 8 символов"
                style={{ ...inputStyle, paddingLeft: 38, paddingRight: 38 }}
              />
              <Lock size={15} color="#888" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <button onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
                {showPass ? <EyeOff size={15} color="#888" /> : <Eye size={15} color="#888" />}
              </button>
            </div>
            {form.password && (
              <div style={{ marginTop: 6, display: 'flex', gap: 4 }}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} style={{
                    flex: 1, height: 3, borderRadius: 2,
                    background: form.password.length >= i * 3 ? (form.password.length >= 8 ? '#00a550' : '#f5a623') : '#e0e0e0',
                  }} />
                ))}
              </div>
            )}
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Подтвердите пароль *</label>
            <input
              type="password"
              value={form.confirm}
              onChange={e => update('confirm', e.target.value)}
              placeholder="Повторите пароль"
              style={{ ...inputStyle, borderColor: form.confirm && form.confirm !== form.password ? '#f44336' : '#ccc' }}
            />
            {form.confirm && form.confirm !== form.password && (
              <div style={{ fontSize: 12, color: '#f44336', marginTop: 4 }}>Пароли не совпадают</div>
            )}
          </div>

          <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 20, cursor: 'pointer', fontSize: 13, color: '#555' }}>
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ marginTop: 2, flexShrink: 0 }} />
            <span>
              Я принимаю <a href="#" style={{ color: 'var(--booking-blue-light)' }}>Условия использования</a> и{' '}
              <a href="#" style={{ color: 'var(--booking-blue-light)' }}>Политику конфиденциальности</a> Booking.com
            </span>
          </label>

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
            Создать аккаунт
          </button>

          <div style={{ textAlign: 'center', fontSize: 14 }}>
            Уже есть аккаунт?{' '}
            <Link to="/login" style={{ color: 'var(--booking-blue-light)', fontWeight: 600, textDecoration: 'none' }}>
              Войти
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
