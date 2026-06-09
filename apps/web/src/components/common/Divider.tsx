export default function Divider({ className = '' }: { className?: string }) {
  return <div className={`h-px flex-shrink-0 ${className}`} style={{ background: 'var(--color-border)' }} />
}
