import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initFirebase } from '@smartnote/shared/firebase'
import './index.css'
import './i18n'
import App from './App.tsx'

// Firebase 초기화 (서비스/스토어 사용 전에 반드시 선행). 웹은 VITE_* + DEV 시 로컬 에뮬레이터
initFirebase({
  config: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  },
  emulator: import.meta.env.DEV ? { host: '127.0.0.1' } : false,
})

console.log('[Kakao] SDK loaded?', typeof window.Kakao, window.Kakao)
console.log('[Kakao] JS key present?', !!import.meta.env.VITE_KAKAO_JS_KEY)
window.Kakao.init(import.meta.env.VITE_KAKAO_JS_KEY)
console.log('[Kakao] isInitialized:', window.Kakao.isInitialized())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
