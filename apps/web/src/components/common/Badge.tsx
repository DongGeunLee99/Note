import { TONES, type Tone } from '@/theme/tones'

interface BadgeProps {
  children: React.ReactNode
  variant?: Tone
}

export default function Badge({ children, variant = 'gray' }: BadgeProps) {
  const tone = TONES[variant]
  return (
    <span
      className="text-[9px] px-1.5 py-px rounded-lg whitespace-nowrap"
      style={{ background: tone.bg, color: tone.text }}
    >
      {children}
    </span>
  )
}
