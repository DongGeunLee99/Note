import { useState } from 'react'
import { Platform, Pressable, Text, TextInput, View } from 'react-native'
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { formatTime } from '../../utils/alarmFormat'

interface TimePickerFieldProps {
  hour: number
  minute: number
  onChange: (hour: number, minute: number) => void
}

const clamp = (v: number, max: number) => Math.min(Math.max(v, 0), max)

/**
 * 시간 선택. iOS: 휠 인라인 / Android: 탭하면 시스템 다이얼로그 /
 * 웹(브라우저 미리보기): DateTimePicker 미지원이라 시·분 숫자 입력
 */
export default function TimePickerField({ hour, minute, onChange }: TimePickerFieldProps) {
  const [showAndroid, setShowAndroid] = useState(false)

  if (Platform.OS === 'web') {
    return (
      <View className="flex-row items-center justify-center gap-2 py-2">
        <TextInput
          value={String(hour)}
          onChangeText={t => onChange(clamp(Number(t.replace(/\D/g, '')) || 0, 23), minute)}
          keyboardType="number-pad"
          maxLength={2}
          className="w-16 rounded-lg border border-gray-200 py-2 text-center text-2xl text-gray-900"
        />
        <Text className="text-2xl text-gray-900">:</Text>
        <TextInput
          value={String(minute).padStart(2, '0')}
          onChangeText={t => onChange(hour, clamp(Number(t.replace(/\D/g, '')) || 0, 59))}
          keyboardType="number-pad"
          maxLength={2}
          className="w-16 rounded-lg border border-gray-200 py-2 text-center text-2xl text-gray-900"
        />
      </View>
    )
  }

  const value = new Date()
  value.setHours(hour, minute, 0, 0)

  const handleChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setShowAndroid(false)
    if (event.type === 'set' && date) onChange(date.getHours(), date.getMinutes())
  }

  if (Platform.OS === 'android') {
    return (
      <>
        <Pressable onPress={() => setShowAndroid(true)} className="items-center py-3">
          <Text className="text-4xl font-medium text-gray-900">{formatTime(hour, minute)}</Text>
        </Pressable>
        {showAndroid && <DateTimePicker value={value} mode="time" is24Hour onChange={handleChange} />}
      </>
    )
  }

  return (
    <DateTimePicker value={value} mode="time" display="spinner" locale="ko-KR" onChange={handleChange} />
  )
}
