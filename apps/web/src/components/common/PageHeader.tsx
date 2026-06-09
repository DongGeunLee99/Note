interface PageHeaderProps {
  title: string
  children?: React.ReactNode
}

export default function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <div
      className="flex items-center gap-2 px-4 py-2.5 border-b flex-shrink-0"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <span className="text-[13px] font-medium flex-1">{title}</span>
      {children}
    </div>
  )
}
