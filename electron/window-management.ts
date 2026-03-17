import { BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'
// import { MAIN_WINDOW_VITE_DEV_SERVER_URL, MAIN_WINDOW_VITE_NAME } from './main'
import { fileURLToPath } from 'node:url'
import { AISession, createBlob, endAISession, startAISession } from './ai'

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string
declare const MAIN_WINDOW_VITE_NAME: string

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export type AppWindows = {
  main: BrowserWindow | null
  projector: BrowserWindow | null
}

export const windows: AppWindows = {
  main: null,
  projector: null,
}

export function createMainWindow() {
  windows.main = new BrowserWindow({
    title: 'HeyBible - Control Panel',
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    windows.main.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}?view=control-panel`)
  } else {
    windows.main.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
      { query: { view: 'control-panel' } }
    )
  }
}

export async function createProjectorWindow() {
  windows.projector = new BrowserWindow({
    title: 'HeyBible - Projector',
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    await windows.projector.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}?view=projector`)
  } else {
    await windows.projector.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
      { query: { view: 'projector' } }
    )
  }
}

export const listenToIPC = () => {
  ipcMain.handle('start-ai-session', async (_) => {
    createProjectorWindow()
    await startAISession(windows)
  })

  ipcMain.handle('end-ai-session' , (_) => {
    endAISession()
  })

  ipcMain.on('audio-chunk', (_, { audioData }) => {
    if (AISession) AISession.sendRealtimeInput({ media: createBlob(audioData) })
  })

  ipcMain.on('message:projector', (_, { type, verse }) => {
    windows.projector?.webContents.send(type, { verse })
  })
}