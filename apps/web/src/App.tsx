import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSettingsStore, resolveTheme } from './stores/useSettingsStore'
import { AuthProvider, useAuthContext } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import Spinner from './components/common/Spinner'
import AppLayout from './components/layout/AppLayout'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import AlarmPage from './pages/AlarmPage'
import MemoPage from './pages/MemoPage'
import LaterPage from './pages/LaterPage'
import SomedayPage from './pages/SomedayPage'
import CalendarPage from './pages/CalendarPage'
import TrashPage from './pages/TrashPage'
import DashboardPage from './pages/DashboardPage'
import SettingsPage from './pages/SettingsPage'

/** 인증 로딩 중 표시할 전체 화면 스피너 */
function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  )
}

/** 로그인한 사용자만 접근 허용. 비로그인 시 /login으로, 로딩 중엔 스피너 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthContext()
  if (loading) return <AuthLoading />
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

/** 루트('/') 진입 시 로그인 여부로 분기: 로그인 → /home, 비로그인 → /login */
function RootRedirect() {
  const { user, loading } = useAuthContext()
  if (loading) return <AuthLoading />
  return <Navigate to={user ? '/home' : '/login'} replace />
}

/** theme 설정을 <html data-theme>에 반영. 'system'이면 OS 다크모드 변경을 실시간 추종 */
function ThemeManager() {
  const theme = useSettingsStore(s => s.theme)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      document.documentElement.dataset.theme = resolveTheme(theme, mq.matches)
    }
    apply()
    if (theme !== 'system') return
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [theme])

  return null
}

export default function App() {
  // 브라우저 기본 우클릭 메뉴 전역 차단 (입력 영역은 붙여넣기 등을 위해 허용)
  useEffect(() => {
    function blockContextMenu(e: MouseEvent) {
      const target = e.target as HTMLElement
      if (target.closest('input, textarea, [contenteditable]')) return
      e.preventDefault()
    }
    document.addEventListener('contextmenu', blockContextMenu)
    return () => document.removeEventListener('contextmenu', blockContextMenu)
  }, [])

  return (
    <BrowserRouter>
      <ThemeManager />
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<RootRedirect />} />
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="home" element={<HomePage />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="alarm" element={<AlarmPage />} />
              <Route path="memo" element={<MemoPage />} />
              <Route path="later" element={<LaterPage />} />
              <Route path="someday" element={<SomedayPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="trash" element={<TrashPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
