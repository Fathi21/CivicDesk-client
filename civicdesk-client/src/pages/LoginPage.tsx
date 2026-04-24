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

  const handleSubmit = async (e: { preventDefault(): void }) => {
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
    <div className="login-page">
      <div className="login-card card">
        <h2 style={{ margin: '0 0 0.25rem', fontSize: 20, fontWeight: 700 }}>Admin Login</h2>
        <p className="text-sm text-2" style={{ marginBottom: '1.5rem' }}>
          Sign in to access the admin dashboard.
        </p>

        <form onSubmit={handleSubmit} className="form-stack">
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              className="form-input"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <button type="submit" disabled={loading} className="btn btn-primary btn-full" style={{ marginTop: 4 }}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
