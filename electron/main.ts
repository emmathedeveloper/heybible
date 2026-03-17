import { app, BrowserWindow } from 'electron'
// import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { createMainWindow, listenToIPC, windows } from './window-management'
import { updateElectronApp } from "update-electron-app"
import electronSquirrelStartup from 'electron-squirrel-startup'

// const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

if(app.isPackaged){
  updateElectronApp()
}

// Electron Forge / Squirrel startup
if (process.platform === 'win32' && electronSquirrelStartup) {
  app.quit()
}


declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string
declare const MAIN_WINDOW_VITE_NAME: string

// Forge Vite plugin exposes these env vars
// export const MAIN_WINDOW_VITE_DEV_SERVER_URL = process.env['MAIN_WINDOW_VITE_DEV_SERVER_URL']
// export const MAIN_WINDOW_VITE_NAME = process.env['MAIN_WINDOW_VITE_NAME'] || "main_window"

// Keep VITE_PUBLIC working for icons etc.
process.env.VITE_PUBLIC = MAIN_WINDOW_VITE_DEV_SERVER_URL
  ? path.join(path.resolve(__dirname, '../..'), 'public')
  : path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}`)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    windows.main = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow()
  }
})

listenToIPC()
app.whenReady().then(createMainWindow)