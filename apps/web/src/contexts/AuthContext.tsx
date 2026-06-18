import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import type { User } from 'firebase/auth'
import { useAuth } from '@smartnote/shared/hooks/useAuth'
import { loginWithKakao, logoutKakao } from '@smartnote/shared/hooks/useKakaoAuth'
import { db } from '@smartnote/shared/firebase'

export interface UserProfile {
  nickname: string
  profileImage: string | null
}

interface AuthContextValue {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)

  // 로그인된 사용자의 Firestore 프로필(카카오 닉네임·이미지) 구독
  useEffect(() => {
    if (!user) {
      setProfile(null)
      return
    }
    const unsub = onSnapshot(doc(db, 'users', user.uid), snap => {
      const data = snap.data()
      setProfile(data ? { nickname: data.nickname ?? '', profileImage: data.profileImage ?? null } : null)
    })
    return () => unsub()
  }, [user])

  return (
    <AuthContext.Provider value={{ user, profile, loading, login: loginWithKakao, logout: logoutKakao }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}
