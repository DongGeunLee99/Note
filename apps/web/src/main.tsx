import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import App from './App.tsx'

console.log('[Kakao] SDK loaded?', typeof window.Kakao, window.Kakao)
console.log('[Kakao] JS key present?', !!import.meta.env.VITE_KAKAO_JS_KEY)
window.Kakao.init(import.meta.env.VITE_KAKAO_JS_KEY)
console.log('[Kakao] isInitialized:', window.Kakao.isInitialized())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
