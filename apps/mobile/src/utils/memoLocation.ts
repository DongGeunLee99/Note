import { Platform } from 'react-native'
import * as Location from 'expo-location'
import type { MemoLocation } from '@smartnote/shared/types'

/**
 * 현재 위치 → 동네 이름. 권한 거부·실패 시 null (사용자가 직접 입력).
 * 웹(브라우저 미리보기)은 reverseGeocode 미지원이라 바로 null
 */
export async function getCurrentMemoLocation(): Promise<MemoLocation | null> {
  if (Platform.OS === 'web') return null
  try {
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') return null
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
    const { latitude: lat, longitude: lng } = pos.coords
    const [place] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng })
    const label = place?.district ?? place?.subregion ?? place?.city ?? '현재 위치'
    return { lat, lng, label }
  } catch {
    return null
  }
}
