// 알람 비프음 — 음원 에셋 없이 Web Audio API 오실레이터로 생성.
// 브라우저 자동재생 정책상 사용자 제스처 없이 막힐 수 있어, 호출부는 모달/OS알림으로 보완한다.

let ctx: AudioContext | null = null
let osc: OscillatorNode | null = null
let gain: GainNode | null = null
let beatTimer: ReturnType<typeof setInterval> | null = null

/** 비프 반복 시작 (이미 울리는 중이면 무시) */
export function startAlarmSound() {
  if (osc) return
  try {
    ctx = ctx ?? new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    void ctx.resume()
    gain = ctx.createGain()
    gain.gain.value = 0
    gain.connect(ctx.destination)
    osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = 880
    osc.connect(gain)
    osc.start()
    // 0.4초 울리고 0.4초 쉬는 패턴 반복
    const beat = () => {
      if (!ctx || !gain) return
      const t = ctx.currentTime
      gain.gain.cancelScheduledValues(t)
      gain.gain.setValueAtTime(0.25, t)
      gain.gain.setValueAtTime(0, t + 0.4)
    }
    beat()
    beatTimer = setInterval(beat, 800)
  } catch {
    // Web Audio 미지원/차단 — 무음 폴백 (모달·OS알림으로 알림)
  }
}

/** 비프 정지 + 리소스 정리 */
export function stopAlarmSound() {
  if (beatTimer) { clearInterval(beatTimer); beatTimer = null }
  try { osc?.stop() } catch { /* 이미 정지 */ }
  osc?.disconnect()
  gain?.disconnect()
  osc = null
  gain = null
}
