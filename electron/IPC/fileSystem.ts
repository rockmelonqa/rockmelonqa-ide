import chokidar, { FSWatcher } from "chokidar";
import { BrowserWindow, dialog } from "electron";
import path from "path";
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
  deleteFileSystem: deleteFileSystem,
  getCloneFilePath: getCloneFilePath,
  getFolder: getFolder,
  pickFolder: pickFolder,
  readFile: readFile,
  readFileBase64: readFileBase64,
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
  await fs.createFolder(path);
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

/** Generates cloned file name when pasting the same file at nth time */
const genClonedFileNameAtNth = (srcFileNameWithoutExt: string, ext: string, n: number) => {
  if (n === 1) {
    return `${srcFileNameWithoutExt} - Copy${ext}`;
  }
  return `${srcFileNameWithoutExt} - Copy (${n})${ext}`;
};

/**
 * Gets clone file path with Windows copy/paste file in-place convention
 */
async function getCloneFilePath(
  browserWindow: BrowserWindow,
  event: Electron.IpcMainEvent,
  filePath: string
): Promise<string | null> {
  try {
    const srcFileNameWithoutExt = path.parse(filePath).name;
    const srcFileExt = path.extname(filePath);
    const srcDir = path.dirname(filePath);

    // Use Windows Explorer file copy/paste naming pattern:
    // EX:
    // - Src file name:             Document.txt
    // - First copied file name:    Document - Copy.txt
    // - Second copied file name:   Document - Copy (2).txt
    // - etc...

    let pastingTries = 1;
    while (true) {
      let newClonedFileName = genClonedFileNameAtNth(srcFileNameWithoutExt, srcFileExt, pastingTries);
      let newClonedFilePath = path.join(srcDir, newClonedFileName);
      let existing = await fs.checkExists(newClonedFilePath);
      if (!existing) {
        return newClonedFilePath;
      }
      pastingTries += 1;
    }
  } catch (error) {
    console.log("CANNOT clone file:", filePath);
    console.error(error);
    throw error;
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
 * Read file content as base64 string
 */
async function readFileBase64(
  browserWindow: BrowserWindow,
  event: Electron.IpcMainEvent,
  filePath: string
): Promise<string | null> {
  try {
    return await fs.readFile(filePath, "base64");
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
