/// <reference path="../types/kakao.d.ts" />
import { signInWithCustomToken, signOut } from 'firebase/auth'
import { httpsCallable } from 'firebase/functions'
import { auth, functions } from '../firebase/config'

interface KakaoLoginResponse {
  firebaseToken: string
  isNewUser: boolean
}

/** authorize() 요청과 code 교환 시 반드시 동일해야 하는 리다이렉트 URI. 배포 도메인에서도 그대로 동작하도록 현재 origin 기준으로 계산 */
export function getKakaoRedirectUri(): string {
  return `${window.location.origin}/auth/kakao/callback`
}

/** 카카오 로그인 화면으로 리다이렉트. v2 SDK는 팝업(Auth.login) 미지원 — Authorization Code Flow만 지원 */
export async function loginWithKakao(): Promise<void> {
  console.log('[Kakao] authorize 호출. isInitialized:', window.Kakao.isInitialized())
  window.Kakao.Auth.authorize({
    redirectUri: getKakaoRedirectUri(),
    // 브라우저에 남아있는 카카오 세션으로 자동 로그인되는 것을 막고 매번 계정 확인/재인증을 강제
    prompt: 'login',
  })
}

/** 카카오 콜백 페이지에서 인가 코드를 받아 로그인 완료. Cloud Function이 code→토큰 교환 + Firebase 커스텀 토큰 발급을 수행 */
export async function completeKakaoLogin(code: string): Promise<void> {
  console.log('[Kakao] completeKakaoLogin 시작')

  const kakaoLogin = httpsCallable<{ code: string; redirectUri: string }, KakaoLoginResponse>(
    functions,
    'kakaoLogin'
  )
  console.log('[Kakao] kakaoLogin Cloud Function 호출')
  const { data } = await kakaoLogin({ code, redirectUri: getKakaoRedirectUri() })
  console.log('[Kakao] kakaoLogin 응답:', data)

  await signInWithCustomToken(auth, data.firebaseToken)
  console.log('[Kakao] signInWithCustomToken 완료')
}

export async function logoutKakao(): Promise<void> {
  await signOut(auth)
  if (window.Kakao.Auth.getAccessToken()) {
    window.Kakao.Auth.logout()
  }
}
