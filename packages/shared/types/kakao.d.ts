interface KakaoStatic {
  init(appKey: string): void
  isInitialized(): boolean
  Auth: {
    login(params: { success: () => void; fail: (err: unknown) => void }): void
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
