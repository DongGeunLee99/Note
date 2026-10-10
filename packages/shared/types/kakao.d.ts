interface KakaoStatic {
  init(appKey: string): void
  isInitialized(): boolean
  Auth: {
    authorize(params: {
      redirectUri: string
      prompt?: 'login' | 'none' | 'create' | 'select_account'
    }): void
    logout(callback?: () => void): void
    getAccessToken(): string | null
  }
}

declare global {
  interface Window {
    Kakao: KakaoStatic
  }
}

export {}
