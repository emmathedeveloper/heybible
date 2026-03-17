import type { ForgeConfig } from '@electron-forge/shared-types'
import { VitePlugin } from '@electron-forge/plugin-vite'
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives'

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
  },
  rebuildConfig: {},
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'emmathedeveloper',
          name: 'heybible'
        },
        draft: true
      }
    }
  ],
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        authors: 'Evberin Emmanuel',
        description: "The Versatile Bible AI. Retrieve scriptures with speed",
      },
    },
    { name: '@electron-forge/maker-zip', config: ['darwin'] },
    {
      name: '@reforged/maker-appimage',
      platforms: ['linux'],
      config: {
        // Your configuration options here
      },
    },
    // { name: '@electron-forge/maker-rpm', config: {} },
    // { name: '@electron-forge/maker-deb', config: {} },
  ],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new VitePlugin({
      build: [
        {
          entry: 'electron/main.ts',
          config: 'vite.main.config.ts',
          target: 'main',
        },
        {
          entry: 'electron/preload.ts',
          config: 'vite.preload.config.ts',
          target: 'preload',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.ts',
        },
      ],
    }),
  ],
}

export default config