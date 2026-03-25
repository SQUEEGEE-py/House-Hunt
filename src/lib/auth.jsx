import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const SESSION_KEY = 'house_hunt_auth'
const CORRECT_HASH_KEY = import.meta.env.VITE_APP_PASSWORD

async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export function AuthProvider({ children }) {
  const [authed, setAuthed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY)
    if (stored === 'ok') setAuthed(true)
    setLoading(false)
  }, [])

  async function login(password) {
    const hash = await hashPassword(password)
    const correctHash = await hashPassword(CORRECT_HASH_KEY)
    if (hash === correctHash) {
      sessionStorage.setItem(SESSION_KEY, 'ok')
      setAuthed(true)
      setError('')
      return true
    } else {
      setError('Incorrect password. Ask a roommate for the right one.')
      return false
    }
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY)
    setAuthed(false)
  }

  return (
    <AuthContext.Provider value={{ authed, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
