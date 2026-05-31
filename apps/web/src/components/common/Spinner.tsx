interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_CLASS = { sm: 'w-3 h-3', md: 'w-4 h-4', lg: 'w-6 h-6' }

export default function Spinner({ size = 'md' }: SpinnerProps) {
  return (
    <svg
      className={`animate-spin ${SIZE_CLASS[size]}`}
      style={{ color: 'var(--color-primary)' }}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )
}
