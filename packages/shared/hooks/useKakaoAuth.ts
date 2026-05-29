import { signInWithCustomToken, signOut } from 'firebase/auth'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { auth } from '../firebase/config'

interface KakaoLoginResponse {
  firebaseToken: string
  isNewUser: boolean
}

export async function loginWithKakao(): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    window.Kakao.Auth.login({
      success: () => resolve(),
      fail: (err: unknown) => reject(err),
    })
  })

  const accessToken = window.Kakao.Auth.getAccessToken()
  if (!accessToken) throw new Error('카카오 액세스 토큰을 받지 못했습니다.')

  const functions = getFunctions()
  const kakaoLogin = httpsCallable<{ accessToken: string }, KakaoLoginResponse>(
    functions,
    'kakaoLogin'
  )
  const { data } = await kakaoLogin({ accessToken })

  await signInWithCustomToken(auth, data.firebaseToken)
}

export async function logoutKakao(): Promise<void> {
  await signOut(auth)
  if (window.Kakao.Auth.getAccessToken()) {
    window.Kakao.Auth.logout()
  }
}
