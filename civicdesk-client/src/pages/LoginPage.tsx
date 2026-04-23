import { useState } from 'react'
import { auth } from '../services/api'

interface Props {
  onSuccess: () => void
}

export default function LoginPage({ onSuccess }: Props) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await auth.login({ username, password })
      onSuccess()
    } catch {
      setError('Invalid username or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      minHeight: '60vh', padding: '2rem'
    }}>
      <div style={{
        background: '#fff', borderRadius: 10, padding: '2rem',
        width: '100%', maxWidth: 380,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 4px 16px rgba(0,0,0,0.06)'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '0.25rem', fontSize: 20 }}>Admin Login</h2>
        <p style={{ margin: '0 0 1.5rem', color: '#6b7280', fontSize: 14 }}>
          Sign in to access the admin dashboard.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 500 }}>Username</span>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoComplete="username"
              style={{
                padding: '0.6rem 0.75rem', borderRadius: 6,
                border: '1px solid #d1d5db', fontSize: 14, outline: 'none'
              }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 500 }}>Password</span>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={{
                padding: '0.6rem 0.75rem', borderRadius: 6,
                border: '1px solid #d1d5db', fontSize: 14, outline: 'none'
              }}
            />
          </label>

          {error && (
            <p style={{
              margin: 0, color: '#dc2626', fontSize: 13,
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: 6, padding: '0.5rem 0.75rem'
            }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.65rem', borderRadius: 6,
              background: '#1d4ed8', color: '#fff',
              border: 'none', fontSize: 14, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1, marginTop: '0.25rem'
            }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
