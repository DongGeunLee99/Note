import Spinner from './Spinner'
import { useTranslation } from 'react-i18next'

type AiMode = 'original' | 'ai'

interface AiToggleButtonProps {
  mode: AiMode
  onModeChange: (mode: AiMode) => void
  loading?: boolean
}

export default function AiToggleButton({ mode, onModeChange, loading = false }: AiToggleButtonProps) {
  const { t } = useTranslation()
  return (
    <div
      className="inline-flex rounded-lg p-0.5 text-[calc(10px*var(--fs))]"
      style={{ background: 'var(--color-surface-2)' }}
    >
      <button
        onClick={() => onModeChange('original')}
        className={`px-2.5 py-1 rounded-md transition-colors ${
          mode === 'original'
            ? 'bg-[var(--color-surface)] font-medium shadow-sm'
            : 'hover-tint'
        }`}
        style={{ color: mode === 'original' ? 'var(--color-text)' : 'var(--color-muted)' }}
      >
        {t('memo.aiOriginal')}
      </button>
      <button
        onClick={() => onModeChange('ai')}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
          mode === 'ai'
            ? 'bg-[var(--color-surface)] font-medium shadow-sm'
            : 'hover-tint'
        }`}
        style={{ color: mode === 'ai' ? 'var(--color-primary)' : 'var(--color-muted)' }}
      >
        {loading ? <Spinner size="sm" /> : null}
        {t('memo.aiSummary')}
      </button>
    </div>
  )
}
