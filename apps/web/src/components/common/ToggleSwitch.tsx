interface ToggleSwitchProps {
  enabled: boolean
  onToggle: () => void
  disabled?: boolean
  size?: 'sm' | 'md'
}

export default function ToggleSwitch({ enabled, onToggle, disabled = false, size = 'md' }: ToggleSwitchProps) {
  const track = size === 'sm' ? 'w-7 h-4' : 'w-9 h-5'
  const thumb = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'
  const translate = size === 'sm' ? 'translate-x-3.5' : 'translate-x-4'

  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      disabled={disabled}
      className={`relative inline-flex items-center rounded-full transition-colors focus:outline-none ${track} ${
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
      }`}
      style={{ background: enabled ? 'var(--color-primary)' : 'var(--color-border-2)' }}
    >
      <span
        className={`inline-block rounded-full bg-white shadow transition-transform ${thumb} ${
          enabled ? translate : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}
