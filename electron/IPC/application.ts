import { app, BrowserWindow, dialog } from "electron";
import os from "os";
import path from "path";
import {
  AutomationFramework,
  fileDefFactory,
  IAppInfo,
  IEnvironmentInfo,
  IIpcGenericResponse,
  IIpcResponse,
  IRmProjFile,
  IUserSettings,
  Language,
  StandardFolder,
  TestFramework,
} from "rockmelonqa.common";
import * as fileSystem from "../utils/fileSystem";
import { IChannels } from "./core/channelsInterface";
import IPC from "./core/ipc";

const nameAPI = "application";

const USER_DATA = "userData";
const USER_SETTINGS_FILE = "user-settings.json";

// to Main
const validSendChannel: IChannels = {
  setUserSettings: setUserSettings,
  openProject: openProject,
};

const validInvokeChannel: IChannels = {
  getAppInfo: getAppInfo,
  getEnvironmentInfo: getEnvironmentInfo,
  getUserSettings: getUserSettings,
  createNewProject: createNewProject,
};

// from Main
const validReceiveChannel: string[] = ["createNewProject", "loadProject", "quit"];

class ApplicationIPC extends IPC {
  async openProject(browserWindow: BrowserWindow) {
    await openProject(browserWindow);
  }
  quit(browserWindow: BrowserWindow) {
    quit(browserWindow);
  }
}

const application = new ApplicationIPC({
  nameAPI,
  validSendChannel,
  validInvokeChannel,
  validReceiveChannel,
});

/*
 * Application IPC:
 * - Read/write user settings
 * - Read/write app (or project) state
 * - ...
 */
export default application;

function getAppInfo(mainWindow: BrowserWindow, event: Electron.IpcMainEvent, message: any): IAppInfo {
  const version = app.getVersion();
  return { version };
}

async function getUserSettings(browserWindow: BrowserWindow, event: Electron.IpcMainEvent): Promise<IUserSettings> {
  const dirPath = path.join(app.getPath(USER_DATA));
  const filePath = path.join(dirPath, USER_SETTINGS_FILE);
  const fileExists = await fileSystem.checkExists(filePath);
  if (!fileExists) {
    // create empty file
    await fileSystem.createFolder(dirPath);
    await fileSystem.writeFile(filePath, JSON.stringify(fileDefFactory.newUserSetting(), null, 4));
  }

  // read file
  const rawData = await fileSystem.readFile(filePath);
  const data = JSON.parse(rawData) as IUserSettings;
  return data;
}

async function setUserSettings(browserWindow: BrowserWindow, event: Electron.IpcMainEvent, data: IUserSettings) {
  const dirPath = path.join(app.getPath(USER_DATA));
  const folderExists = await fileSystem.checkExists(dirPath);
  if (!folderExists) {
    await fileSystem.createFolder(dirPath);
  }

  const filePath = path.join(dirPath, USER_SETTINGS_FILE);
  await fileSystem.writeFile(filePath, JSON.stringify(data, null, 4));
}

async function createNewProject(
  browserWindow: BrowserWindow,
  event: Electron.IpcMainEvent,
  project: IRmProjFile
): Promise<IIpcResponse> {
  let errorCode = await validateProject(project, true);
  if (errorCode) {
    return {
      isSuccess: false,
      errorCode: errorCode,
    } as IIpcResponse;
  }

  await Promise.all([
<<<<<<< HEAD
    fileSystem.createFolder(path.join(project.folderPath, StandardFolder.CustomCode)),
    fileSystem.createFolder(path.join(project.folderPath, StandardFolder.Logs)),
    fileSystem.createFolder(path.join(project.folderPath, StandardFolder.OutputCode)),
    fileSystem.createFolder(path.join(project.folderPath, StandardFolder.PageDefinitions)),
    fileSystem.createFolder(path.join(project.folderPath, StandardFolder.TestCases)),
    fileSystem.createFolder(path.join(project.folderPath, StandardFolder.TestRoutines)),
    fileSystem.createFolder(path.join(project.folderPath, StandardFolder.TestRuns)),
    fileSystem.createFolder(path.join(project.folderPath, StandardFolder.TestSuites)),
=======
    //fileSystem.createFoler(path.join(project.folderPath, StandardFolder.CustomCode)),
    fileSystem.createFoler(path.join(project.folderPath, StandardFolder.Logs)),
    fileSystem.createFoler(path.join(project.folderPath, StandardFolder.OutputCode)),
    fileSystem.createFoler(path.join(project.folderPath, StandardFolder.PageDefinitions)),
    fileSystem.createFoler(path.join(project.folderPath, StandardFolder.TestCases)),
    //fileSystem.createFoler(path.join(project.folderPath, StandardFolder.TestRoutines)),
    fileSystem.createFoler(path.join(project.folderPath, StandardFolder.TestRuns)),
    fileSystem.createFoler(path.join(project.folderPath, StandardFolder.TestSuites)),
>>>>>>> main
    fileSystem.writeFile(path.join(project.folderPath, project.fileName), JSON.stringify(project.content, null, 4)),
  ]);

  return {
    isSuccess: true,
  } as IIpcResponse;
}

async function validateProject(project: IRmProjFile, isNewProject: boolean): Promise<string> {
  const folder = project.folderPath;
  const { automationFramework, language, testFramework } = project.content;

  if (isNewProject) {
    // validation: selected folder must be empty
    let isFolderEmpty = await fileSystem.isEmptyFolder(folder);
    if (!isFolderEmpty) {
      return "FolderNotEmpty";
    }
  }

  // validation: Automation Framework vs Language vs Test Framework
  let isFrameworkValid = false;

  if (automationFramework == AutomationFramework.Playwright) {
    isFrameworkValid =
      (language === Language.CSharp &&
        [TestFramework.MSTest, TestFramework.NUnit, TestFramework.xUnit].some((i) => i === testFramework)) ||
      (language === Language.Java && testFramework === TestFramework.JUnit);
  } else if (automationFramework === AutomationFramework.Selenium) {
    isFrameworkValid = language === Language.Java && testFramework === TestFramework.JUnit;
  }

  if (!isFrameworkValid) {
    return "InvalidFramework";
  }

  // everything is valid
  return "";
}

async function openProject(browserWindow: BrowserWindow, event?: Electron.IpcMainEvent) {
  const { canceled, filePaths } = await dialog.showOpenDialog(browserWindow, {
    filters: [{ name: "Rm Project", extensions: ["rmproj"] }],
    properties: ["openFile"],
  });

  let response: IIpcGenericResponse<IRmProjFile>;

  if (canceled) {
    return;
  }

  try {
    let filePath = filePaths[0];
    let fileContent = await fileSystem.readFile(filePath);

    let data: IRmProjFile = {
      content: JSON.parse(fileContent),
      fileName: path.basename(filePath),
      folderPath: path.dirname(filePath),
    };

    response = { isSuccess: true, data: data };
  } catch (error) {
    response = { isSuccess: false, errorCode: "InvalidFile", errorMessage: "Invalid file" };
  }

  browserWindow.webContents.send("loadProject", response);
}

async function quit(browserWindow: BrowserWindow) {
  browserWindow.webContents.send("quit");
}

/**
 * Get environment info
 */
async function getEnvironmentInfo(
  browserWindow: BrowserWindow,
  event: Electron.IpcMainEvent
): Promise<IEnvironmentInfo> {
  return {
    pathSeparator: path.sep,
    eol: os.EOL,
  };
}
