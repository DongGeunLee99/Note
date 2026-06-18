export default function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[calc(9px*var(--fs))] uppercase tracking-wide font-medium" style={{ color: 'var(--color-muted)' }}>
      {children}
    </p>
  )
}
