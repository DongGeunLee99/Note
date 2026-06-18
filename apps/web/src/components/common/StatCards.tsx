interface StatCardsProps {
  items: { value: number; label: string }[]
}

export default function StatCards({ items }: StatCardsProps) {
  return (
    <div className="flex gap-1.5">
      {items.map(s => (
        <div
          key={s.label}
          className="flex-1 flex flex-col items-center py-2 rounded-lg"
          style={{ background: 'var(--color-surface-2)' }}
        >
          <span className="text-[calc(16px*var(--fs))] font-medium">{s.value}</span>
          <span className="text-[calc(9px*var(--fs))]" style={{ color: 'var(--color-muted)' }}>{s.label}</span>
        </div>
      ))}
    </div>
  )
}
