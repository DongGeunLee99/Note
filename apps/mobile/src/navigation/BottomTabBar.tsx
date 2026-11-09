import { Animated, Pressable, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs'

const ACTIVE_COLOR = '#111827'
const INACTIVE_COLOR = '#9CA3AF'

/** 스와이프 탭용 하단 아이콘 탭바 (텍스트 없음) — 스와이프 진행도(position)에 따라 활성 색이 실시간으로 바뀜 */
export default function BottomTabBar({ state, descriptors, navigation, position }: MaterialTopTabBarProps) {
  const insets = useSafeAreaInsets()

  return (
    <View
      className="flex-row border-t border-gray-200 bg-white"
      style={{ paddingBottom: insets.bottom }}
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index
        const { options } = descriptors[route.key]
        // 이 탭 위치에 가까울수록 1 → 진한 아이콘을 회색 아이콘 위에 겹쳐서 페이드
        const activeOpacity = position.interpolate({
          inputRange: [index - 1, index, index + 1],
          outputRange: [0, 1, 0],
          extrapolate: 'clamp',
        })

        const handlePress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true })
          if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name)
        }

        return (
          <Pressable
            key={route.key}
            onPress={handlePress}
            accessibilityRole="tab"
            accessibilityState={{ selected: isFocused }}
            accessibilityLabel={options.title}
            className="flex-1 items-center justify-center py-3"
          >
            <View>
              {options.tabBarIcon?.({ focused: false, color: INACTIVE_COLOR })}
              <Animated.View style={{ position: 'absolute', opacity: activeOpacity }}>
                {options.tabBarIcon?.({ focused: true, color: ACTIVE_COLOR })}
              </Animated.View>
            </View>
          </Pressable>
        )
      })}
    </View>
  )
}
