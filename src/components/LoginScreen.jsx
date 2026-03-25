import { useState } from 'react'
import { useAuth } from '../lib/auth'

export default function LoginScreen() {
  const { login, error } = useAuth()
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    await login(password)
    setBusy(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0f0f0f',
      fontFamily: '"DM Mono", "Courier New", monospace',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 380,
        padding: '2.5rem',
        border: '1px solid #2a2a2a',
        borderRadius: 4,
        background: '#141414',
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            fontSize: 11,
            letterSpacing: '0.2em',
            color: '#4a9e6e',
            textTransform: 'uppercase',
            marginBottom: 8,
          }}>Denver House Hunt</div>
          <div style={{ fontSize: 22, color: '#e8e6e0', fontWeight: 400 }}>
            roommates only
          </div>
          <div style={{ fontSize: 13, color: '#555', marginTop: 6, fontFamily: 'system-ui, sans-serif' }}>
            Enter the shared password to access your listings.
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="password"
              autoFocus
              style={{
                width: '100%',
                padding: '10px 14px',
                background: '#1c1c1c',
                border: '1px solid #2a2a2a',
                borderRadius: 4,
                color: '#e8e6e0',
                fontSize: 14,
                fontFamily: '"DM Mono", monospace',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
          {error && (
            <div style={{ fontSize: 12, color: '#c0614a', marginBottom: 12, fontFamily: 'system-ui, sans-serif' }}>
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={busy || !password}
            style={{
              width: '100%',
              padding: '10px',
              background: busy || !password ? '#1c1c1c' : '#4a9e6e',
              color: busy || !password ? '#444' : '#0f0f0f',
              border: '1px solid',
              borderColor: busy || !password ? '#2a2a2a' : '#4a9e6e',
              borderRadius: 4,
              fontSize: 13,
              fontFamily: '"DM Mono", monospace',
              cursor: busy || !password ? 'not-allowed' : 'pointer',
              letterSpacing: '0.1em',
              transition: 'all 0.15s',
            }}
          >
            {busy ? 'checking...' : '→ enter'}
          </button>
        </form>
      </div>
    </div>
  )
}
