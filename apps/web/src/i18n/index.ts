// i18next 초기화. 문구 사전은 locales/ko.json · en.json으로 분리.
// 언어 상태는 useSettingsStore.language가 source of truth이며,
// setLanguage / persist 복원 시 i18n.changeLanguage로 동기화한다.

import i18n from 'i18next'
import { initReactI18next, useTranslation } from 'react-i18next'
import ko from './locales/ko.json'
import en from './locales/en.json'

export type Language = 'ko' | 'en'

i18n.use(initReactI18next).init({
  resources: {
    ko: { translation: ko },
    en: { translation: en },
  },
  lng: 'ko',
  fallbackLng: 'ko',
  interpolation: { escapeValue: false },
  returnNull: false,
})

export default i18n

/** 현재 언어 코드 (컴포넌트에서 사용 — i18n 변경 시 리렌더됨) */
export function useLang(): Language {
  return useTranslation().i18n.language as Language
}
