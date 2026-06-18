import { useSettingsStore, FONT_SCALE_OPTIONS, type TimeFormat, type ThemeMode, type AppLanguage } from '@/stores/useSettingsStore'
import { useTranslation } from 'react-i18next'

const THEME_SWATCHES: { value: ThemeMode; swatch: string | null }[] = [
  { value: 'system', swatch: null },
  { value: 'light',  swatch: '#185FA5' },
  { value: 'dark',   swatch: '#232321' },
  { value: 'purple', swatch: '#7C3AED' },
  { value: 'blue',   swatch: '#1668B8' },
]

function SettingRow({ label, description, children }: {
  label: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
      <div>
        <p className="text-[calc(12px*var(--fs))] font-medium">{label}</p>
        {description && <p className="text-[calc(10px*var(--fs))] mt-0.5" style={{ color: 'var(--color-muted)' }}>{description}</p>}
      </div>
      {children}
    </div>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <p className="text-[calc(9px*var(--fs))] uppercase tracking-widest font-semibold pt-4 pb-1" style={{ color: 'var(--color-muted)' }}>
      {title}
    </p>
  )
}

export default function SettingsPage() {
  const { timeFormat, setTimeFormat, theme, setTheme, language, setLanguage, fontScale, setFontScale } = useSettingsStore()
  const { t } = useTranslation()

  const fontSizeOptions = FONT_SCALE_OPTIONS.map(o => ({ value: o.value, label: t(`settings.${o.key}`) }))

  const themeLabels: Record<ThemeMode, string> = {
    system: t('settings.themeSystem'),
    light: t('settings.themeLight'),
    dark: t('settings.themeDark'),
    purple: t('settings.themePurple'),
    blue: t('settings.themeBlue'),
  }

  const timeFormatOptions: { value: TimeFormat; label: string; example: string }[] = [
    { value: '24h', label: t('settings.h24'), example: '07:30 / 19:30' },
    { value: '12h', label: t('settings.h12'), example: '7:30 AM / 7:30 PM' },
  ]

  const languageOptions: { value: AppLanguage; label: string }[] = [
    { value: 'ko', label: '한국어' },
    { value: 'en', label: 'English' },
    { value: 'ja', label: '日本語' },
  ]

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center gap-2 px-4 py-2.5 border-b flex-shrink-0"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <span className="text-[calc(13px*var(--fs))] font-medium flex-1">{t('settings.title')}</span>
      </div>

      <div className="flex-1 overflow-auto px-4 pb-8 max-w-3xl">
        <SectionHeader title={t('settings.display')} />

        <SettingRow
          label={t('settings.language')}
          description={t('settings.languageDesc')}
        >
          <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'var(--color-border-2)' }}>
            {languageOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setLanguage(opt.value)}
                className="px-3 py-1.5 text-[calc(10px*var(--fs))] font-medium transition-colors"
                style={
                  language === opt.value
                    ? { background: 'var(--color-primary)', color: '#fff' }
                    : { color: 'var(--color-muted)' }
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        </SettingRow>

        <SettingRow
          label={t('settings.theme')}
          description={t('settings.themeDesc')}
        >
          <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'var(--color-border-2)' }}>
            {THEME_SWATCHES.map(opt => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[calc(10px*var(--fs))] font-medium transition-colors"
                style={
                  theme === opt.value
                    ? { background: 'var(--color-primary)', color: '#fff' }
                    : { color: 'var(--color-muted)' }
                }
              >
                {opt.swatch && (
                  <span
                    className="w-2 h-2 rounded-full border flex-shrink-0"
                    style={{ background: opt.swatch, borderColor: 'rgba(128,128,128,0.4)' }}
                  />
                )}
                {themeLabels[opt.value]}
              </button>
            ))}
          </div>
        </SettingRow>

        <SettingRow
          label={t('settings.timeFormat')}
          description={t('settings.timeFormatDesc')}
        >
          <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'var(--color-border-2)' }}>
            {timeFormatOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setTimeFormat(opt.value)}
                className="flex flex-col items-center px-3 py-1.5 text-[calc(10px*var(--fs))] transition-colors"
                style={
                  timeFormat === opt.value
                    ? { background: 'var(--color-primary)', color: '#fff' }
                    : { color: 'var(--color-muted)' }
                }
              >
                <span className="font-medium">{opt.label}</span>
                <span className="text-[calc(9px*var(--fs))] mt-0.5 opacity-75">{opt.example}</span>
              </button>
            ))}
          </div>
        </SettingRow>

        <SettingRow
          label={t('settings.fontSize')}
          description={t('settings.fontSizeDesc')}
        >
          <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'var(--color-border-2)' }}>
            {fontSizeOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setFontScale(opt.value)}
                className="px-3 py-1.5 text-[calc(10px*var(--fs))] font-medium transition-colors"
                style={
                  fontScale === opt.value
                    ? { background: 'var(--color-primary)', color: '#fff' }
                    : { color: 'var(--color-muted)' }
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        </SettingRow>
      </div>
    </div>
  )
}
