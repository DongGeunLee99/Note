import { createContext, useContext, ReactNode } from 'react'
import type { User } from 'firebase/auth'
import { useAuth } from '@smartnote/shared/hooks/useAuth'
import { loginWithKakao, logoutKakao } from '@smartnote/shared/hooks/useKakaoAuth'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  return (
    <AuthContext.Provider value={{ user, loading, login: loginWithKakao, logout: logoutKakao }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}
