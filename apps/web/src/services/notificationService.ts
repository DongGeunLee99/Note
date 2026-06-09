// OS 알림(Web Notification API) 공용 서비스.
// 추후 실제 알람 트리거에서도 이 모듈을 사용한다.

export type NotifyTestResult = 'sent' | 'unsupported' | 'denied'

export async function sendTestNotification(): Promise<NotifyTestResult> {
  if (!('Notification' in window)) return 'unsupported'
  let permission = Notification.permission
  if (permission === 'default') {
    permission = await Notification.requestPermission()
  }
  if (permission === 'denied') return 'denied'
  new Notification('SmartNote', {
    body: '알림 테스트입니다 — 정상 작동 중이에요',
    icon: '/icon.png',
  })
  return 'sent'
}

export const NOTIFICATION_TIPS = [
  { step: '1', label: '집중 지원 / 방해 금지 모드', desc: 'Windows 우하단 알림 센터에서 꺼주세요' },
  { step: '2', label: '브라우저 알림 권한', desc: '주소창 왼쪽 자물쇠 → 알림 → 허용' },
  { step: '3', label: 'Windows 알림 설정', desc: '설정 → 시스템 → 알림 → 브라우저 켜기' },
]
