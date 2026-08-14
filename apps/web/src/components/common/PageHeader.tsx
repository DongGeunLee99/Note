interface PageHeaderProps {
  title: string
  children?: React.ReactNode
}

export default function PageHeader({ children }: PageHeaderProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 flex-shrink-0">
      <div className="flex-1" />
      {children}
    </div>
  )
}
