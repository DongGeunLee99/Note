// i18next 초기화. 문구 사전은 locales/ko.json · en.json으로 분리.
// 언어 상태는 useSettingsStore.language가 source of truth이며,
// setLanguage / persist 복원 시 i18n.changeLanguage로 동기화한다.

import i18n from 'i18next'
import { initReactI18next, useTranslation } from 'react-i18next'
import ko from './locales/ko.json'
import en from './locales/en.json'
import ja from './locales/ja.json'

export type Language = 'ko' | 'en' | 'ja'

/** 지원 언어 목록 (설정 선택지 등에서 단일 출처로 사용) */
export const LANGUAGES: Language[] = ['ko', 'en', 'ja']

/** Intl/toLocale* 호출용 BCP 47 로케일 태그. 언어 추가 시 여기만 채우면 됨 */
export const LOCALE_TAG: Record<Language, string> = {
  ko: 'ko-KR',
  en: 'en-US',
  ja: 'ja-JP',
}

i18n.use(initReactI18next).init({
  resources: {
    ko: { translation: ko },
    en: { translation: en },
    ja: { translation: ja },
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
