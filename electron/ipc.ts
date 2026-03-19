import { ipcMain } from "electron"
import { startAISession, endAISession, AISession, createBlob } from "./ai"
import { createProjectorWindow, windows } from "./window-management"



export const initIPC = () => {
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