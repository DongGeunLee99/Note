import Spinner from './Spinner'
import { useTranslation } from 'react-i18next'

type AiMode = 'original' | 'ai'

interface AiToggleButtonProps {
  mode: AiMode
  onModeChange: (mode: AiMode) => void
  /** AI 정리가 이미 생성된 상태인지 — 라벨을 "AI 정리"/"다시 분석하기"로 전환하는 데 사용 */
  aiProcessed: boolean
  /** AI 탭이 아직 비어있는 상태에서 처음 열리거나, 이미 AI 탭인 상태에서 다시 클릭했을 때 호출 */
  onTrigger: () => void
  loading?: boolean
}

export default function AiToggleButton({ mode, onModeChange, aiProcessed, onTrigger, loading = false }: AiToggleButtonProps) {
  const { t } = useTranslation()

  function handleAiClick() {
    if (mode !== 'ai') {
      onModeChange('ai')
      if (!aiProcessed) onTrigger()
    } else if (aiProcessed) {
      onTrigger()
    }
  }

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
        onClick={handleAiClick}
        disabled={loading}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors disabled:opacity-60 ${
          mode === 'ai'
            ? 'bg-[var(--color-surface)] font-medium shadow-sm'
            : 'hover-tint'
        }`}
        style={{ color: mode === 'ai' ? 'var(--color-primary)' : 'var(--color-muted)' }}
      >
        {loading ? <Spinner size="sm" /> : null}
        {aiProcessed ? t('memo.aiReanalyze') : t('memo.aiSummary')}
      </button>
    </div>
  )
}
