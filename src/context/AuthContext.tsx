import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { clearAuth, loadAuth, saveAuth, StoredAuth, UserRole } from '../lib/authStorage'
import { api, setUnauthorizedHandler } from '../api'

interface AuthState {
  token: string | null
  role: UserRole | null
  familyId: number | null
  childId: number | null
}

interface AuthContextType extends AuthState {
  isReady: boolean
  login: (token: string, role: UserRole, familyId?: number | null, childId?: number) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

function toState(auth: StoredAuth | null): AuthState {
  if (!auth) {
    return { token: null, role: null, familyId: null, childId: null }
  }
  return {
    token: auth.token,
    role: auth.role,
    familyId: auth.familyId,
    childId: auth.childId,
  }
}

async function validateStoredSession(auth: StoredAuth): Promise<boolean> {
  try {
    if (auth.role === 'platform_admin') {
      await api.platformMe()
      return true
    }
    if (auth.role === 'parent') {
      await api.me()
      return true
    }
    await api.childMe()
    return true
  } catch (err) {
    const message = err instanceof Error ? err.message.toLowerCase() : ''
    if (
      message.includes('unauthorized') ||
      message.includes('invalid token') ||
      message.includes('not authenticated') ||
      message.includes('invalid credentials')
    ) {
      return false
    }
    // Backend down / network error — keep local session
    return true
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => toState(loadAuth()))
  const [isReady, setIsReady] = useState(false)

  const logout = useCallback(() => {
    clearAuth()
    setState({ token: null, role: null, familyId: null, childId: null })
  }, [])

  const login = useCallback((token: string, role: UserRole, familyId?: number | null, childId?: number) => {
    const auth: StoredAuth = {
      token,
      role,
      familyId: role === 'platform_admin' ? null : (familyId ?? null),
      childId: childId ?? null,
    }
    saveAuth(auth)
    setState(toState(auth))
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(logout)
    return () => setUnauthorizedHandler(null)
  }, [logout])

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      const stored = loadAuth()
      if (!stored) {
        if (!cancelled) {
          setState(toState(null))
          setIsReady(true)
        }
        return
      }

      setState(toState(stored))
      const valid = await validateStoredSession(stored)
      if (cancelled) return

      if (!valid) {
        clearAuth()
        setState(toState(null))
      }
      setIsReady(true)
    }

    bootstrap()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, isReady, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
