// OS 알림(Web Notification API) 공용 서비스.
// 추후 실제 알람 트리거에서도 이 모듈을 사용한다.
// 문구는 호출부에서 i18n 사전(t.notification)으로 전달한다.

export type NotifyTestResult = 'sent' | 'unsupported' | 'denied'

export async function sendTestNotification(body: string): Promise<NotifyTestResult> {
  if (!('Notification' in window)) return 'unsupported'
  let permission = Notification.permission
  if (permission === 'default') {
    permission = await Notification.requestPermission()
  }
  if (permission === 'denied') return 'denied'
  new Notification('SmartNote', {
    body,
    icon: '/icon.png',
  })
  return 'sent'
}
