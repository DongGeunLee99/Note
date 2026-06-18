interface EmptyStateProps {
  emoji: string
  title: string
  description?: string
}

export default function EmptyState({ emoji, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 h-full gap-2 py-12">
      <span className="text-3xl">{emoji}</span>
      <p className="text-[calc(12px*var(--fs))] font-medium">{title}</p>
      {description && (
        <p className="text-[calc(10px*var(--fs))]" style={{ color: 'var(--color-muted)' }}>{description}</p>
      )}
    </div>
  )
}
