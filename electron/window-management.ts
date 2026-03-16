import { BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'
import { RENDERER_DIST, VITE_DEV_SERVER_URL } from './main'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export type AppWindows = {
  main: BrowserWindow | null,
  projector: BrowserWindow | null,
}

export const windows: AppWindows = {
  main: null,
  projector: null
}

export function createMainWindow() {
  windows.main = new BrowserWindow({
    title: "HeyBible - Control Panel",
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  if (VITE_DEV_SERVER_URL) {
    windows.main.loadURL(VITE_DEV_SERVER_URL + '?view=control-panel')
  } else {
    // windows.main.loadFile('dist/index.html')
    windows.main.loadFile(path.join(RENDERER_DIST, `index.html`) , { query: { view: 'control-panel' } })
  }
}

export function createProjectorWindow() {

  windows.projector = new BrowserWindow({
    title: "HeyBible - Projector",
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  if (VITE_DEV_SERVER_URL) {
    windows.projector.loadURL(VITE_DEV_SERVER_URL + '?view=projector')
  } else {
    // windows.projector.loadFile('dist/index.html')
    windows.projector.loadFile(path.join(RENDERER_DIST, 'index.html') , { query: { view: 'projector' } })
  }
}


export const listenToIPC = () => {

  ipcMain.on('start-ai-session', (_, data) => {
    createProjectorWindow()
  })
}