import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuthContext } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthContext()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">로딩 중...</div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppRoutes() {
  const { user, loading } = useAuthContext()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">로딩 중...</div>

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoute><div className="p-8 text-gray-800">홈 화면 (준비 중)</div></ProtectedRoute>} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
