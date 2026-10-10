import { useEffect, useRef, useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { completeKakaoLogin } from '@smartnote/shared/hooks/useKakaoAuth'
import { useAuthContext } from '@/contexts/AuthContext'
import Spinner from '@/components/common/Spinner'

/** 카카오 authorize() 리다이렉트가 돌아오는 콜백 페이지. code를 받아 로그인을 완료한다 */
export default function KakaoCallbackPage() {
  const { t } = useTranslation()
  const { user } = useAuthContext()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  // StrictMode 이중 렌더링 시 동일 code로 두 번 교환 시도하는 것을 방지 (인가 코드는 1회용)
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true

    const code = searchParams.get('code')
    const kakaoError = searchParams.get('error')

    console.log('[Kakao] 콜백 진입. code:', !!code, 'error:', kakaoError)

    if (kakaoError || !code) {
      console.error('[Kakao] 콜백에 code 없음 또는 에러 파라미터', kakaoError)
      setError(t('login.failed'))
      return
    }

    completeKakaoLogin(code).catch(err => {
      console.error('[Kakao] completeKakaoLogin 실패', err)
      setError(t('login.failed'))
    })
  }, [searchParams, t])

  if (user) return <Navigate to="/home" replace />

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
      {error ? (
        <>
          <p className="text-sm text-red-500">{error}</p>
          <a href="/login" className="text-sm underline text-gray-600">{t('login.kakaoStart')}</a>
        </>
      ) : (
        <Spinner size="lg" />
      )}
    </div>
  )
}
