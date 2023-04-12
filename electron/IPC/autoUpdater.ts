import { BrowserWindow } from "electron";
import { autoUpdater as AU, ProgressInfo, UpdateDownloadedEvent, UpdateInfo } from "electron-updater";
import { IChannels } from "./core/channelsInterface";
import IPC from "./core/ipc";

// Reference to use at renderer:
// https://github.com/el3um4s/renderer-for-electron-auto-updater

const nameAPI = "autoUpdater";

// to Main
const validSendChannel: IChannels = {
  checkForUpdates: checkForUpdates,
  startDownloadUpdate: startDownloadUpdate,
  quitAndInstall: quitAndInstall,
};

const validInvokeChannel: IChannels = {};

// from Main
const validReceiveChannel: string[] = [
  "checkingForUpdate",
  "updateAvailable",
  "updateNotAvailable",
  "downloadProgress",
  "updateDownloaded",
  "errorOnAutoUpdate",
];

class AutoUpdater extends IPC {
  initAutoUpdater(mainWindow: BrowserWindow) {
    initAutoUpdater(mainWindow);
  }
}

const autoUpdater = new AutoUpdater({
  nameAPI,
  validSendChannel,
  validInvokeChannel,
  validReceiveChannel,
});

/*
 * Auto update IPC
 */
export default autoUpdater;

function initAutoUpdater(mainWindow: BrowserWindow) {
  AU.on("checking-for-update", () => {
    mainWindow.webContents.send("checkingForUpdate");
  });

  AU.on("error", (err: any) => {
    mainWindow.webContents.send("errorOnAutoUpdate", err);
  });

  AU.on("update-available", (info: UpdateInfo) => {
    mainWindow.webContents.send("updateAvailable", info);
  });

  AU.on("download-progress", (info: ProgressInfo) => {
    mainWindow.webContents.send("downloadProgress", info);
  });

  AU.on("update-downloaded", (info: UpdateDownloadedEvent) => {
    mainWindow.webContents.send("updateDownloaded", info);
  });

  AU.on("update-not-available", (info: UpdateInfo) => {
    mainWindow.webContents.send("updateNotAvailable", info);
  });
}

function checkForUpdates(mainWindow: BrowserWindow, event: Electron.IpcMainEvent, message: any) {
  AU.autoDownload = false;
  AU.checkForUpdates();
}

function startDownloadUpdate(mainWindow: BrowserWindow, event: Electron.IpcMainEvent, message: any) {
  AU.downloadUpdate();
}

function quitAndInstall(mainWindow: BrowserWindow, event: Electron.IpcMainEvent, message: any) {
  AU.quitAndInstall();
}
