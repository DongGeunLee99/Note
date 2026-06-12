import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSettingsStore, resolveTheme } from './stores/useSettingsStore'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
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

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return <>{children}</>
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
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route index element={<HomePage />} />
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
