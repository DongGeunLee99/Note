import { useSettingsStore, type TimeFormat } from '../stores/useSettingsStore'

const TIME_FORMAT_OPTIONS: { value: TimeFormat; label: string; example: string }[] = [
  { value: '24h', label: '24-hour', example: '07:30 / 19:30' },
  { value: '12h', label: '12-hour', example: '7:30 AM / 7:30 PM' },
]

function SettingRow({ label, description, children }: {
  label: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
      <div>
        <p className="text-[12px] font-medium">{label}</p>
        {description && <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-muted)' }}>{description}</p>}
      </div>
      {children}
    </div>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <p className="text-[9px] uppercase tracking-widest font-semibold pt-4 pb-1" style={{ color: 'var(--color-muted)' }}>
      {title}
    </p>
  )
}

export default function SettingsPage() {
  const { timeFormat, setTimeFormat } = useSettingsStore()

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center gap-2 px-4 py-2.5 border-b flex-shrink-0"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <span className="text-[13px] font-medium flex-1">Settings</span>
      </div>

      <div className="flex-1 overflow-auto px-4 pb-8 max-w-xl">
        <SectionHeader title="Display" />

        <SettingRow
          label="Time Format"
          description="Applies to alarms, calendar, and all time displays"
        >
          <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'var(--color-border-2)' }}>
            {TIME_FORMAT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setTimeFormat(opt.value)}
                className="flex flex-col items-center px-3 py-1.5 text-[10px] transition-colors"
                style={
                  timeFormat === opt.value
                    ? { background: 'var(--color-primary)', color: '#fff' }
                    : { color: 'var(--color-muted)' }
                }
              >
                <span className="font-medium">{opt.label}</span>
                <span className="text-[9px] mt-0.5 opacity-75">{opt.example}</span>
              </button>
            ))}
          </div>
        </SettingRow>
      </div>
    </div>
  )
}
