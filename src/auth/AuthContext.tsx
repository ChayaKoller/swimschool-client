import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { setUnauthorizedHandler, tokenStore } from '../api/client'
import { authApi } from '../api/endpoints'
import type { CurrentUser } from '../api/types'
import { useToast } from '../components/Toast'

interface AuthState {
  user: CurrentUser | null
  loading: boolean
  // True after the user chose to log out (then the next login starts from the home page)
  loggedOut: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(() => tokenStore.get() !== null)
  const [loggedOut, setLoggedOut] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const toast = useToast()

  const logout = useCallback(() => {
    setLoggedOut(true)
    navigate('/login', { replace: true })
    tokenStore.clear()
    setUser(null)
    queryClient.clear()
  }, [navigate, queryClient])

  // Expired or revoked session: back to login with a clear message
  useEffect(() => {
    setUnauthorizedHandler(() => {
      if (!tokenStore.get()) return
      tokenStore.clear()
      setUser(null)
      queryClient.clear()
      toast.error('החיבור הסתיים', 'יש להתחבר מחדש')
    })
  }, [queryClient, toast])

  // Restore the session after a page refresh
  useEffect(() => {
    if (!tokenStore.get()) return
    authApi
      .me()
      .then(setUser)
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const result = await authApi.login(email, password)
    tokenStore.set(result.token)
    setLoggedOut(false)
    setUser(result.user)
  }, [])

  const value = useMemo(() => ({ user, loading, loggedOut, login, logout }), [user, loading, loggedOut, login, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
