import { BrowserWindow, ipcMain, app } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
const __dirname$2 = path.dirname(fileURLToPath(import.meta.url));
const windows = {
  main: null,
  projector: null
};
function createMainWindow() {
  windows.main = new BrowserWindow({
    title: "HeyBible - Control Panel",
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname$2, "preload.mjs")
    }
  });
  if (VITE_DEV_SERVER_URL) {
    windows.main.loadURL(VITE_DEV_SERVER_URL + "?view=control-panel");
  } else {
    windows.main.loadFile(path.join(RENDERER_DIST, `index.html`), { query: { view: "control-panel" } });
  }
}
function createProjectorWindow() {
  windows.projector = new BrowserWindow({
    title: "HeyBible - Projector",
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname$2, "preload.mjs")
    }
  });
  if (VITE_DEV_SERVER_URL) {
    windows.projector.loadURL(VITE_DEV_SERVER_URL + "?view=projector");
  } else {
    windows.projector.loadFile(path.join(RENDERER_DIST, "index.html"), { query: { view: "projector" } });
  }
}
const listenToIPC = () => {
  ipcMain.on("start-ai-session", (_, data) => {
    createProjectorWindow();
  });
};
createRequire(import.meta.url);
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    windows.main = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});
listenToIPC();
app.whenReady().then(createMainWindow);
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
