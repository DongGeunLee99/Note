interface PillButtonProps {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}

export default function PillButton({ active, onClick, children }: PillButtonProps) {
  return (
    <button
      onClick={onClick}
      className="text-[calc(9px*var(--fs))] px-2.5 py-1 rounded-full border transition-colors"
      style={
        active
          ? { background: 'var(--color-primary)', color: '#fff', borderColor: 'var(--color-primary)' }
          : { color: 'var(--color-muted)', borderColor: 'var(--color-border-2)' }
      }
    >
      {children}
    </button>
  )
}
