import { app, BrowserWindow, desktopCapturer, session } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import os from 'node:os'
import { autoUpdater } from 'electron-updater'
import { createSplashWindow } from './window-management'
import { initIPC } from './ipc'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createSplashWindow()
  }
})

app.on("ready", () => {
  autoUpdater.checkForUpdatesAndNotify()
})

initIPC()

app.whenReady().then(() => {
  session.defaultSession.setDisplayMediaRequestHandler(async (_, callback) => {
    const sources = await desktopCapturer.getSources({
      types: ['window', 'screen'],
      thumbnailSize: { width: 1, height: 1 }
    })

    if (os.platform() === 'linux') {
      // On Linux/Wayland, sources already contains only the user's chosen source
      callback({ video: sources[0] })
    } else {
      // On Windows/macOS, pick the specific window by title
      const target = sources.find(s => s.name.includes('HeyBible - Projector'))
      callback({ video: target ?? sources[0] })
    }
  })

  createSplashWindow()
})
