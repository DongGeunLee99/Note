import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route index element={<HomePage />} />
              <Route path="alarm" element={<AlarmPage />} />
              <Route path="memo" element={<MemoPage />} />
              <Route path="later" element={<LaterPage />} />
              <Route path="someday" element={<SomedayPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="trash" element={<TrashPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
