import { useState } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'

export default function LoginPage() {
  const { login } = useAuthContext()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin() {
    setLoading(true)
    setError(null)
    try {
      await login()
    } catch {
      setError('로그인에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">SmartNote</h1>
        <p className="mt-2 text-gray-500">알람·메모·캘린더를 하나로</p>
      </div>

      <button
        onClick={handleLogin}
        disabled={loading}
        className="flex items-center gap-3 bg-[#FEE500] hover:bg-[#F0D800] disabled:opacity-60 text-gray-900 font-medium px-6 py-3 rounded-xl transition-colors"
      >
        {loading ? '로그인 중...' : '카카오로 시작하기'}
      </button>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
