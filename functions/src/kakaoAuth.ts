import { getAuth } from 'firebase-admin/auth'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'

const kakaoRestApiKey = defineSecret('KAKAO_REST_API_KEY')
const kakaoClientSecret = defineSecret('KAKAO_CLIENT_SECRET')

interface KakaoLoginRequest {
  code: string
  redirectUri: string
}

interface KakaoTokenResponse {
  access_token: string
}

interface KakaoUser {
  id: number
  kakao_account?: {
    profile?: {
      nickname?: string
      profile_image_url?: string
    }
  }
}

export const kakaoLogin = onCall<KakaoLoginRequest>({ cors: true, secrets: [kakaoRestApiKey, kakaoClientSecret] }, async (request) => {
  const { code, redirectUri } = request.data

  if (!code || !redirectUri) {
    throw new HttpsError('invalid-argument', '인가 코드가 필요합니다.')
  }

  // Authorization Code → Access Token 교환 (카카오 v2 로그인은 클라이언트에서 토큰을 직접 못 받고 서버에서 교환해야 함)
  let accessToken: string
  try {
    console.log('[kakaoLogin] 토큰 교환 요청', { redirectUri, clientIdLength: kakaoRestApiKey.value().length })
    const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: kakaoRestApiKey.value(),
        client_secret: kakaoClientSecret.value(),
        redirect_uri: redirectUri,
        code,
      }),
    })
    const rawBody = await tokenResponse.text()
    if (!tokenResponse.ok) {
      console.error('[kakaoLogin] 토큰 교환 실패', tokenResponse.status, rawBody)
      throw new HttpsError('unauthenticated', `카카오 인가 코드가 유효하지 않습니다: ${rawBody}`)
    }
    const tokenData = JSON.parse(rawBody) as KakaoTokenResponse
    accessToken = tokenData.access_token
  } catch (error) {
    if (error instanceof HttpsError) throw error
    console.error('[kakaoLogin] 토큰 교환 중 예외', error)
    throw new HttpsError('internal', '카카오 토큰 교환 중 오류가 발생했습니다.')
  }

  let kakaoUser: KakaoUser
  try {
    const response = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!response.ok) {
      throw new HttpsError('unauthenticated', '유효하지 않은 카카오 토큰입니다.')
    }
    kakaoUser = (await response.json()) as KakaoUser
  } catch (error) {
    if (error instanceof HttpsError) throw error
    throw new HttpsError('internal', '카카오 API 오류가 발생했습니다.')
  }

  const uid = `kakao:${kakaoUser.id}`
  const nickname = kakaoUser.kakao_account?.profile?.nickname ?? '사용자'
  const profileImage = kakaoUser.kakao_account?.profile?.profile_image_url ?? null

  const firebaseToken = await getAuth().createCustomToken(uid)

  const db = getFirestore()
  const userRef = db.doc(`users/${uid}`)
  const userDoc = await userRef.get()

  const now = Timestamp.now()
  let isNewUser = false
  if (!userDoc.exists) {
    isNewUser = true
    await userRef.set({
      uid,
      kakaoId: String(kakaoUser.id),
      nickname,
      profileImage,
      settings: { defaultSound: 'default', defaultVibration: true },
      createdAt: now,
      updatedAt: now,
    })
    await userRef.collection('alarmGroups').add({
      name: '기타',
      color: '#5F5E5A',
      icon: 'default',
      isEnabled: true,
      isDefault: true,
      order: 0,
      isDeleted: false,
      deletedAt: null,
      createdAt: now,
    })
  } else {
    // 기존 사용자: 매 로그인마다 카카오 프로필(이름·이미지) 최신화
    await userRef.set({ nickname, profileImage, updatedAt: now }, { merge: true })
  }

  return { firebaseToken, isNewUser }
})
