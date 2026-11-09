import { Alert, Platform } from 'react-native'

// react-native-web의 Alert.alert는 아무것도 띄우지 않으므로 브라우저 미리보기에선 window.confirm으로 대체

/** 삭제 등 확인이 필요한 동작. 확인 시 onConfirm 실행 */
export function confirmAction(title: string, message: string, confirmLabel: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n${message}`)) onConfirm()
    return
  }
  Alert.alert(title, message, [
    { text: '취소', style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onConfirm },
  ])
}

/** 단순 안내 (확인 버튼만) */
export function showMessage(title: string, message?: string) {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n${message}` : title)
    return
  }
  Alert.alert(title, message)
}

export interface ActionItem {
  label: string
  onPress: () => void
  destructive?: boolean
}

/**
 * 길게 누르기 메뉴. 네이티브는 버튼 목록 Alert.
 * 웹엔 동등한 UI가 없어 첫 항목(수정)을 바로 실행 — 수정 시트 안에서 삭제 가능
 */
export function showActions(title: string, actions: ActionItem[]) {
  if (Platform.OS === 'web') {
    actions[0]?.onPress()
    return
  }
  Alert.alert(title, undefined, [
    ...actions.map(a => ({ text: a.label, onPress: a.onPress, style: a.destructive ? 'destructive' as const : 'default' as const })),
    { text: '취소', style: 'cancel' as const },
  ])
}
