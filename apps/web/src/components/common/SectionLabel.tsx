export default function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[9px] uppercase tracking-wide font-medium" style={{ color: 'var(--color-muted)' }}>
      {children}
    </p>
  )
}
