import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore'
import { getFunctions, connectFunctionsEmulator, type Functions } from 'firebase/functions'

/** 플랫폼이 주입하는 Firebase 설정값 (웹: VITE_*, 모바일: EXPO_PUBLIC_*) */
export interface FirebaseEnv {
  apiKey?: string
  authDomain?: string
  projectId?: string
  storageBucket?: string
  messagingSenderId?: string
  appId?: string
  measurementId?: string
}

export interface InitFirebaseOptions {
  config: FirebaseEnv
  /** 에뮬레이터 연결. host는 웹=127.0.0.1, 모바일 실기기=개발PC LAN IP. false면 운영 접속 */
  emulator?: { host: string } | false
  /** 플랫폼별 Auth 생성 (모바일은 AsyncStorage persistence 주입). 미지정 시 getAuth 기본 */
  initAuth?: (app: FirebaseApp) => Auth
}

// 서비스/훅이 `import { db } from '../firebase/config'`로 참조하는 라이브 바인딩.
// initFirebase() 호출 전엔 미할당이며, 실제 사용(런타임)은 항상 init 이후에 일어난다.
export let auth: Auth
export let db: Firestore
export let functions: Functions

let initialized = false

/** 앱 진입 시 1회 호출. 플랫폼별 env/persistence/에뮬레이터를 주입해 Firebase를 초기화한다 */
export function initFirebase(options: InitFirebaseOptions): void {
  if (initialized) return
  initialized = true

  const app = getApps().length === 0 ? initializeApp(options.config) : getApps()[0]
  auth = options.initAuth ? options.initAuth(app) : getAuth(app)
  db = getFirestore(app)
  functions = getFunctions(app)

  // HMR로 config 모듈이 재평가돼도 에뮬레이터 중복 연결을 막기 위해 전역 플래그로 1회만 연결
  if (options.emulator) {
    const g = globalThis as { __SN_EMULATORS_CONNECTED__?: boolean }
    if (!g.__SN_EMULATORS_CONNECTED__) {
      g.__SN_EMULATORS_CONNECTED__ = true
      const { host } = options.emulator
      connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true })
      connectFirestoreEmulator(db, host, 8080)
      connectFunctionsEmulator(functions, host, 5001)
    }
  }
}
