import { BrowserWindow } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { RENDERER_DIST, VITE_DEV_SERVER_URL } from './main'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export type AppWindows = {
  main: BrowserWindow | null
  splash: BrowserWindow | null
  auth: BrowserWindow | null
  projector: BrowserWindow | null
}

export const windows: AppWindows = {
  main: null,
  splash: null,
  auth: null,
  projector: null,
}

export function createSplashWindow() {
  windows.splash = new BrowserWindow({
    title: 'HeyBible',
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    frame: false,
    height: 400,
    width: 600
  })

  if (VITE_DEV_SERVER_URL) {
    windows.splash.loadURL(`${VITE_DEV_SERVER_URL}?view=splash`)
  } else {
    windows.splash.loadFile(
      path.join(RENDERER_DIST, 'index.html'),
      { query: { view: 'splash' } }
    )
  }

  setTimeout(() => {
    windows.splash?.close()

    createMainWindow()
  } , 5000)
}

export function createAuthWindow() {
  windows.main = new BrowserWindow({
    title: 'Authenticate',
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
    autoHideMenuBar: true
  })

  if (VITE_DEV_SERVER_URL) {
    windows.main.loadURL(`${VITE_DEV_SERVER_URL}?view=auth`)
  } else {
    windows.main.loadFile(
      path.join(RENDERER_DIST, 'index.html'),
      { query: { view: 'auth' } }
    )
  }
}

export function createMainWindow() {
  windows.main = new BrowserWindow({
    title: 'HeyBible - Control Panel',
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
    autoHideMenuBar: true
  })

  if (VITE_DEV_SERVER_URL) {
    windows.main.loadURL(`${VITE_DEV_SERVER_URL}?view=control-panel`)
  } else {
    windows.main.loadFile(
      path.join(RENDERER_DIST, 'index.html'),
      { query: { view: 'control-panel' } }
    )
  }
}

export async function createProjectorWindow() {
  windows.projector = new BrowserWindow({
    title: 'HeyBible - Projector',
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
    autoHideMenuBar: true
  })

  if (VITE_DEV_SERVER_URL) {
    await windows.projector.loadURL(`${VITE_DEV_SERVER_URL}?view=projector`)
  } else {
    await windows.projector.loadFile(
      path.join(RENDERER_DIST, 'index.html'),
      { query: { view: 'projector' } }
    )
  }
}