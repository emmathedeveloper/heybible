import { BrowserWindow, ipcMain } from "electron"
import { startAISession, endAISession, AISession, createBlob } from "./ai"
import { createProjectorWindow, windows } from "./window-management"



export const initIPC = () => {
  ipcMain.handle('load-license-key', async (event) => {

    const win = BrowserWindow.fromWebContents(event.sender)

    const onStepCallback = (step: string) => {
      win?.webContents.send("load-license-key:step", step);
    };

    await new Promise(res => setTimeout(res , 3000))
    
    // Now use onStepCallback normally in your logic
    onStepCallback("Verifying license...");

    await new Promise(res => setTimeout(res , 3000))
    // ... your license loading logic
    onStepCallback("Done!");
  })

  ipcMain.handle('start-ai-session', async (_) => {
    createProjectorWindow()
    await startAISession(windows)
  })

  ipcMain.handle('end-ai-session', (_) => {
    endAISession()
  })

  ipcMain.on('audio-chunk', (_, { audioData }) => {
    if (AISession) AISession.sendRealtimeInput({ media: createBlob(audioData) })
  })

  ipcMain.on('message:projector', (_, { type, verse }) => {
    windows.projector?.webContents.send(type, { verse })
  })
}