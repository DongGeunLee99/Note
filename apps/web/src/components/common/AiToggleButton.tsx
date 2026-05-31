import Spinner from './Spinner'

type AiMode = 'original' | 'ai'

interface AiToggleButtonProps {
  mode: AiMode
  aiReady: boolean
  onModeChange: (mode: AiMode) => void
  loading?: boolean
}

export default function AiToggleButton({ mode, aiReady, onModeChange, loading = false }: AiToggleButtonProps) {
  return (
    <div
      className="inline-flex rounded-lg p-0.5 text-[10px]"
      style={{ background: 'var(--color-surface-2)' }}
    >
      <button
        onClick={() => onModeChange('original')}
        className={`px-2.5 py-1 rounded-md transition-colors ${
          mode === 'original'
            ? 'bg-white font-medium shadow-sm'
            : 'hover:bg-white/60'
        }`}
        style={{ color: mode === 'original' ? '#1a1a18' : 'var(--color-muted)' }}
      >
        원문
      </button>
      <button
        onClick={() => aiReady && onModeChange('ai')}
        disabled={!aiReady && !loading}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
          mode === 'ai'
            ? 'bg-white font-medium shadow-sm'
            : aiReady
            ? 'hover:bg-white/60'
            : 'opacity-40 cursor-not-allowed'
        }`}
        style={{ color: mode === 'ai' ? 'var(--color-primary)' : 'var(--color-muted)' }}
      >
        {loading ? <Spinner size="sm" /> : null}
        AI 정리
      </button>
    </div>
  )
}
