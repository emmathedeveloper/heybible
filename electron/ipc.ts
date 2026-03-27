import { BrowserWindow, desktopCapturer, ipcMain, session } from "electron"
import { createMainWindow, createProjectorWindow, windows } from "./window-management"
import { LicenseManager } from "./license-manager"
import { hostname, userInfo } from "node:os"
import { VITE_DEV_SERVER_URL } from "./main"

export const PUBLIC_KEY = `
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuy7SIcO4mKHl1tAg+d86h1uEblLukjjrkkkweiYfEehxlWWj3mfe5vov5PoEkEICvF2lWzXBuiDElA/YMhaJHyauM6GpKrxVfuhWiTczh402kWnNl2v73j0KZXD5Syha2YCD7zqehRg2x67ezGVExuWOmhvt6XQpkTjztZ4KXXy0OqHB8tODFYwtaFBvuQuPjgrZbB8IsW0tYsD7SIaugefBlSM9mzA7sycR+s2uJBDAoL9mZc5fO5F8tB+7JQJM/wv+fKfdscRhzHgdhC8wd6L0K+itDGhEpB7B0fDLMfiwiIRcIx3PxGU9Sy2bD3tvPMTfYyaBtGMOmkqp2cJiDQIDAQAB
`

const licenseManager = new LicenseManager(PUBLIC_KEY)

export const initIPC = () => {
  ipcMain.handle('load-license-key', async (event, licenseKey?: string) => {
    const win = BrowserWindow.fromWebContents(event.sender)

    const onStepCallback = (step: string) => {
      win?.webContents.send("load-license-key:step", step)
    }

    try {
      // Resolve license key: use provided arg or fall back to stored one
      const license = licenseKey ?? await licenseManager.getLicense()

      if (!license) {
        onStepCallback("NO_LICENSE_FOUND")
        return { valid: false, error: "No license found" }
      }

      // Step 2: Online verification — registers device and checks revocation status
      onStepCallback("VERIFYING_LICENSE")
      const LICENSE_API_URL = "https://heybible-server.onrender.com/api"

      const result = await licenseManager.verifyOnline(license, LICENSE_API_URL, {
        appVersion: process.env.npm_package_version,
        os: process.platform,
        name: userInfo().username,
        hostname: hostname(),
      })

      if (!result.valid) {
        onStepCallback("INVALID_OR_REVOKED_LICENSE")
        return { valid: false, error: result.error ?? "License check failed" }
      }

      onStepCallback("LICENSE_VERIFIED")
      return { valid: true, plan: result.plan, licenseId: result.licenseId }

    } catch (err) {
      console.error("load-license-key error:", err)
      onStepCallback("VERIFICATION_FAILED")
      return { valid: false, error: "Unexpected error during verification" }
    }
  })

  ipcMain.handle('save-license-key', async (_, licenseKey: string) => {
    try {
      await licenseManager.saveLicense(licenseKey)
      return { success: true }
    } catch (err) {
      console.error("save-license-key error:", err)
      return { success: false, error: "Failed to save license" }
    }
  })

  ipcMain.handle('clear-license-key', async () => {
    try {
      await licenseManager.clearLicense()
      return { success: true }
    } catch (err) {
      console.error("clear-license-key error:", err)
      return { success: false, error: "Failed to clear license" }
    }
  })

  ipcMain.on('open-projector', (_) => {
    createProjectorWindow()
  })

  ipcMain.on('close-projector', (_) => {
    windows.projector?.close()
  })

  ipcMain.on('goto-app', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)

    win?.close()

    createMainWindow()
  })

  ipcMain.on('message:projector', (_, { type, ...data }) => {
    windows.projector?.webContents.send(type, data)
  })

  ipcMain.handle('get-projector-id', async (_) => {
    
  })
}
