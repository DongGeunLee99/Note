type BadgeVariant = 'blue' | 'amber' | 'gray' | 'violet' | 'green' | 'red'

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  blue:   'bg-[#E6F1FB] text-[#0C447C]',
  amber:  'bg-[#FAEEDA] text-[#633806]',
  gray:   'bg-[#F1EFE8] text-[#444441]',
  violet: 'bg-[#EEEDFE] text-[#3C3489]',
  green:  'bg-[#EAF3DE] text-[#27500A]',
  red:    'bg-[#FCEBEB] text-[#791F1F]',
}

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
}

export default function Badge({ children, variant = 'gray' }: BadgeProps) {
  return (
    <span className={`text-[9px] px-1.5 py-px rounded-lg whitespace-nowrap ${VARIANT_STYLES[variant]}`}>
      {children}
    </span>
  )
}
