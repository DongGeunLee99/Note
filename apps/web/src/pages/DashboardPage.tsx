import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

// ── 목업 데이터 ──────────────────────────────────────────
const WEEKLY_DATA = [
  { day: '월', 기록: 3 },
  { day: '화', 기록: 7 },
  { day: '수', 기록: 2 },
  { day: '목', 기록: 5 },
  { day: '금', 기록: 8 },
  { day: '토', 기록: 1 },
  { day: '일', 기록: 4 },
]

const CATEGORY_DATA = [
  { name: '메모',   value: 15, color: '#6B7280' },
  { name: '일정',   value: 12, color: '#185FA5' },
  { name: '알람',   value: 7,  color: '#2563EB' },
  { name: '할일',   value: 8,  color: '#D97706' },
  { name: '나중에', value: 5,  color: '#7C3AED' },
  { name: '언젠가', value: 3,  color: '#16A34A' },
]
const CATEGORY_TOTAL = CATEGORY_DATA.reduce((s, d) => s + d.value, 0)

const ALARM_TIME_DATA = [
  { time: '새벽', range: '0–6시',   count: 1 },
  { time: '오전', range: '6–12시',  count: 8 },
  { time: '오후', range: '12–18시', count: 4 },
  { time: '저녁', range: '18–24시', count: 5 },
]

const WORK_DAYS    = 22
const NON_WORK_DAYS = 8
const TOTAL_DAYS   = 30
const WORK_MONTH_DATA = [
  { name: '출근일',   value: WORK_DAYS,     color: '#185FA5' },
  { name: '비출근일', value: NON_WORK_DAYS, color: '#e5e7eb' },
]

const STATS = [
  { value: 30, label: '이번 주 기록',    color: '#185FA5' },
  { value: 12, label: '활성 알람',       color: '#D97706' },
  { value: 22, label: '이번 달 출근일',  color: '#16A34A' },
  { value: 5,  label: '미완료 할일',     color: '#7C3AED' },
]

// ── 공통 컴포넌트 ─────────────────────────────────────────
function StatCard({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div
      className="flex-1 rounded-xl border p-3"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <p className="text-[22px] font-semibold leading-none mb-1" style={{ color }}>{value}</p>
      <p className="text-[10px]" style={{ color: '#69696a' }}>{label}</p>
    </div>
  )
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl border p-4 flex flex-col"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <p className="text-[12px] font-medium mb-0.5">{title}</p>
      <p className="text-[10px] mb-3" style={{ color: '#69696a' }}>{subtitle}</p>
      {children}
    </div>
  )
}

function ChartTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-lg border px-2.5 py-1.5 text-[10px] shadow-sm"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      {label && <p className="font-medium mb-0.5" style={{ color: '#1a1a18' }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: <span className="font-medium">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

// ── 페이지 ────────────────────────────────────────────────
export default function DashboardPage() {
  const today = new Date()
  const dateLabel = `${today.getMonth() + 1}월 ${today.getDate()}일`

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div
        className="flex items-center gap-2 px-4 py-2.5 border-b flex-shrink-0"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <span className="text-[13px] font-medium flex-1">대시보드</span>
        <span className="text-[10px]" style={{ color: '#69696a' }}>{dateLabel}</span>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-4">

        {/* 요약 스탯 */}
        <div className="flex gap-3">
          {STATS.map(s => <StatCard key={s.label} {...s} />)}
        </div>

        {/* 차트 2×2 그리드 */}
        <div className="grid grid-cols-2 gap-4">

          {/* 1. 주간 입력 활동량 */}
          <ChartCard title="주간 입력 활동량" subtitle="최근 7일 기록 수">
            <ResponsiveContainer width="100%" height={170}>
              <LineChart data={WEEKLY_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ebebea" />
                <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#69696a' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#69696a' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="기록"
                  stroke="#185FA5"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#185FA5', strokeWidth: 0 }}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 2. 카테고리 분포 */}
          <ChartCard title="카테고리 분포" subtitle={`전체 ${CATEGORY_TOTAL}개 기록`}>
            <div className="flex items-center gap-2">
              <div className="relative flex-shrink-0" style={{ width: 140, height: 140 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={CATEGORY_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={60}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {CATEGORY_DATA.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[18px] font-semibold" style={{ color: '#1a1a18' }}>{CATEGORY_TOTAL}</span>
                  <span className="text-[8px]" style={{ color: '#69696a' }}>총 기록</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                {CATEGORY_DATA.map(d => (
                  <div key={d.name} className="flex items-center gap-1.5 text-[10px]">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                    <span className="flex-1" style={{ color: '#69696a' }}>{d.name}</span>
                    <span className="font-medium" style={{ color: '#1a1a18' }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>

          {/* 3. 알람 시간대 분포 */}
          <ChartCard title="알람 시간대 분포" subtitle="시간대별 알람 수">
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={ALARM_TIME_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ebebea" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#69696a' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#69696a' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" name="알람" fill="#185FA5" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 4. 이번 달 출근일 */}
          <ChartCard title="이번 달 출근일" subtitle={`${today.getMonth() + 1}월 기준 · 총 ${TOTAL_DAYS}일`}>
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0" style={{ width: 140, height: 140 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={WORK_MONTH_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={60}
                      dataKey="value"
                      strokeWidth={0}
                      startAngle={90}
                      endAngle={-270}
                    >
                      {WORK_MONTH_DATA.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[18px] font-semibold" style={{ color: '#185FA5' }}>{WORK_DAYS}</span>
                  <span className="text-[8px]" style={{ color: '#69696a' }}>출근일</span>
                </div>
              </div>
              <div className="flex flex-col gap-3 flex-1">
                {[
                  { label: '출근일',   value: WORK_DAYS,     color: '#185FA5', bg: '#E6F1FB' },
                  { label: '비출근일', value: NON_WORK_DAYS, color: '#6B7280', bg: '#f3f4f6' },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span style={{ color: '#69696a' }}>{item.label}</span>
                      <span className="font-medium" style={{ color: item.color }}>{item.value}일</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#f3f4f6' }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(item.value / TOTAL_DAYS) * 100}%`,
                          background: item.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
                <p className="text-[9px]" style={{ color: '#69696a' }}>
                  출근율 {Math.round((WORK_DAYS / TOTAL_DAYS) * 100)}%
                </p>
              </div>
            </div>
          </ChartCard>

        </div>
      </div>
    </div>
  )
}
