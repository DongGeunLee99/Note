// NativeWind v4 + reanimated v4(=react-native-worklets) 바벨 설정
module.exports = function (api) {
  api.cache(true)
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    // worklets 플러그인은 반드시 마지막
    plugins: ['react-native-worklets/plugin'],
  }
}
