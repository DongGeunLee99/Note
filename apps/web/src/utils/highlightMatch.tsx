// 검색어 매치 구간을 <mark>로 감싸 하이라이트. query가 비어있으면 원문 그대로 반환.

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function highlightMatch(text: string, query: string): React.ReactNode {
  const q = query.trim()
  if (!q) return text
  const parts = text.split(new RegExp(`(${escapeRegExp(q)})`, 'gi'))
  if (parts.length === 1) return text
  return parts.map((part, i) =>
    part.toLowerCase() === q.toLowerCase()
      ? <mark key={i} style={{ background: 'var(--color-primary-subtle)', color: 'var(--color-primary-emphasis)' }}>{part}</mark>
      : part,
  )
}
