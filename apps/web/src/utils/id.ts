let seq = 0

// 로컬 목업 데이터용 ID 생성기. HMR/리렌더에도 중복되지 않는다.
// Phase 2에서 Firestore 자동 ID로 대체.
export function newLocalId(prefix = ''): string {
  return `${prefix}${Date.now().toString(36)}${(seq++).toString(36)}`
}
