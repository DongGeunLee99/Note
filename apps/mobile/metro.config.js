// Expo + pnpm 모노레포 + NativeWind Metro 설정
const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')
const path = require('path')

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, '../..')

const config = getDefaultConfig(projectRoot)

// 모노레포: 워크스페이스 루트까지 파일 감시 (packages/shared 변경 반영)
config.watchFolders = [workspaceRoot]

// node_modules를 앱 → 워크스페이스 루트 순으로 탐색 (pnpm 호이스팅/심링크 대응)
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
]

// pnpm은 심링크 기반이므로 Metro 심링크 해석 활성화
config.resolver.unstable_enableSymlinks = true

module.exports = withNativeWind(config, { input: './global.css' })
