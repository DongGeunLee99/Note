interface EmptyStateProps {
  emoji: string
  title: string
  description?: string
}

export default function EmptyState({ emoji, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 h-full gap-2 py-12">
      <span className="text-3xl">{emoji}</span>
      <p className="text-[12px] font-medium">{title}</p>
      {description && (
        <p className="text-[10px]" style={{ color: 'var(--color-muted)' }}>{description}</p>
      )}
    </div>
  )
}
