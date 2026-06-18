import { getAuth } from 'firebase-admin/auth'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { onCall, HttpsError } from 'firebase-functions/v2/https'

interface KakaoLoginRequest {
  accessToken: string
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

export const kakaoLogin = onCall<KakaoLoginRequest>({ cors: true }, async (request) => {
  const { accessToken } = request.data

  if (!accessToken) {
    throw new HttpsError('invalid-argument', '액세스 토큰이 필요합니다.')
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
