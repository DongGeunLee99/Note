import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthContext } from '@/contexts/AuthContext'

export default function LoginPage() {
  const { t } = useTranslation()
  const { user, login } = useAuthContext()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 이미 로그인된 상태면 홈으로 (로그인 성공 시에도 user 갱신 → 여기서 리다이렉트)
  if (user) return <Navigate to="/home" replace />

  async function handleLogin() {
    setLoading(true)
    setError(null)
    try {
      await login()
    } catch {
      setError(t('login.failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">SmartNote</h1>
        <p className="mt-2 text-gray-500">{t('login.tagline')}</p>
      </div>

      <button
        onClick={handleLogin}
        disabled={loading}
        className="flex items-center gap-3 bg-[#FEE500] hover:bg-[#F0D800] disabled:opacity-60 text-gray-900 font-medium px-6 py-3 rounded-xl transition-colors"
      >
        {loading ? t('login.loggingIn') : t('login.kakaoStart')}
      </button>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
