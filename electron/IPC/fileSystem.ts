import chokidar, { FSWatcher } from "chokidar";
import { BrowserWindow, dialog } from "electron";
import {
  IAddFileWatchEventArgs,
  IFileSystemInfo,
  IGetFolderRequest,
  IIpcResponse,
  IRenameFileRequest,
  IWriteFileRequest,
} from "rockmelonqa.common";
import * as fs from "../utils/fileSystem";
import { IChannels } from "./core/channelsInterface";
import IPC from "./core/ipc";

const nameAPI = "fileSystem";

// to Main
const validSendChannel: IChannels = {
  createFolder: createFolder,
  watch: watch,
};

const validInvokeChannel: IChannels = {
  getFolder: getFolder,
  cloneFileSystem: cloneFileSystem,
  deleteFileSystem: deleteFileSystem,
  pickFolder: pickFolder,
  readFile: readFile,
  rename: rename,
  walkFolder: walkFolder,
  writeFile: writeFile,
};

// from Main
const validReceiveChannel: string[] = ["watch:add", "watch:unlink", "watch:addDir", "watch:unlinkDir", "watch:change"];

const fileSystem = new IPC({
  nameAPI,
  validSendChannel,
  validInvokeChannel,
  validReceiveChannel,
});

/*
 * File System IPC:
 * - Select file or folder
 * - Read, write, delete file or folder
 * - ...
 */
export default fileSystem;

/**
 * Create new folder
 */
async function createFolder(browserWindow: BrowserWindow, event: Electron.IpcMainEvent, path: string): Promise<void> {
  await fs.createFoler(path);
}

/**
 * Delete file or folder at given path
 */
async function deleteFileSystem(
  browserWindow: BrowserWindow,
  event: Electron.IpcMainEvent,
  path: string
): Promise<IIpcResponse> {
  try {
    await fs.deleteFileSystem(path);
    return { isSuccess: true } as IIpcResponse;
  } catch (error: any) {
    return { isSuccess: false, errorMessage: "Cannot delete file" } as IIpcResponse;
  }
}
/**
 * Delete file or folder at given path
 */
async function cloneFileSystem(
  browserWindow: BrowserWindow,
  event: Electron.IpcMainEvent,
  path: string
): Promise<IIpcResponse> {
  try {
    await fs.cloneFileSystem(path);
    return { isSuccess: true } as IIpcResponse;
  } catch (error: any) {
    return { isSuccess: false, errorMessage: "Cannot clone file" } as IIpcResponse;
  }
}

/**
 * Get folder info
 */
async function getFolder(
  browserWindow: BrowserWindow,
  event: Electron.IpcMainEvent,
  message: IGetFolderRequest
): Promise<IFileSystemInfo | null> {
  return await fs.getFolder(message.path, message.includeChildren);
}

/**
 * Invoke OS folder picker to select a folder
 */
async function pickFolder(browserWindow: BrowserWindow, event: Electron.IpcMainEvent): Promise<string | void> {
  const { canceled, filePaths } = await dialog.showOpenDialog(browserWindow, { properties: ["openDirectory"] });
  if (canceled) {
    return;
  } else {
    return filePaths[0];
  }
}

/**
 * Read file content as text
 */
async function readFile(
  browserWindow: BrowserWindow,
  event: Electron.IpcMainEvent,
  filePath: string
): Promise<string | null> {
  try {
    return await fs.readFile(filePath);
  } catch (error) {
    return null;
  }
}

/**
 * Rename file system
 */
async function rename(
  browserWindow: BrowserWindow,
  event: Electron.IpcMainEvent,
  data: IRenameFileRequest
): Promise<IIpcResponse> {
  try {
    await fs.rename(data.oldPath, data.newPath);
    return { isSuccess: true } as IIpcResponse;
  } catch (error: any) {
    return { isSuccess: false, errorMessage: "Cannot rename file" } as IIpcResponse;
  }
}

/**
 * Get children file system (folder/file) of given path
 */
async function walkFolder(
  browserWindow: BrowserWindow,
  event: Electron.IpcMainEvent,
  folderPath: string
): Promise<IIpcResponse> {
  try {
    const files = await fs.walkFolder(folderPath);
    return { isSuccess: true, data: files } as IIpcResponse;
  } catch (error) {
    return { isSuccess: false, errorMessage: "Cannot walk folder" };
  }
}

// Singleton watcher (ensure only one watcher object is being used),
// to stop the old one before watching new path
let fsWatcher: FSWatcher;

/**
 * Watch changes at specific file or folder
 */
async function watch(browserWindow: BrowserWindow, event: Electron.IpcMainEvent, path: string): Promise<void> {
  if (fsWatcher != null) {
    await fsWatcher.close();
  }

  let isReady = false;
  fsWatcher = chokidar.watch(path);
  fsWatcher
    .on("add", function (path) {
      browserWindow.webContents.send("watch:add", {
        path,
        isReady,
      } as IAddFileWatchEventArgs);
    })
    .on("unlink", function (path) {
      if (isReady) {
        browserWindow.webContents.send("watch:unlink", path);
      }
    })
    .on("addDir", function (path) {
      if (isReady) {
        browserWindow.webContents.send("watch:addDir", path);
      }
    })
    .on("unlinkDir", function (path) {
      if (isReady) {
        browserWindow.webContents.send("watch:unlinkDir", path);
      }
    })
    .on("change", function (path) {
      if (isReady) {
        browserWindow.webContents.send("watch:change", path);
      }
    })
    .on("ready", function () {
      isReady = true;
    });
}

async function writeFile(
  browserWindow: BrowserWindow,
  event: Electron.IpcMainEvent,
  data: IWriteFileRequest
): Promise<void> {
  await fs.writeFile(data.filePath, data.fileContent);
}
