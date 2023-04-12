import { BrowserWindow } from "electron";
import fs from "fs";
import moment from "moment";
import path from "path";
import { IIpcGenericResponse, IProgressDetail, IProgressEvent, StandardFolder } from "rockmelonqa.common";
import { StandardOutputFile } from "rockmelonqa.common/file-defs";
import { IRunTestRequest, IRunTestResponseData } from "rockmelonqa.common/ipc-defs";
import * as fileSystem from "../utils/fileSystem";
import { StringBuilder } from "../utils/stringBuilder";
import { IRunTestActionResult, IRunTestContext, runTest as runTestInWorker } from "../worker/actions/runTest";
import { IChannels } from "./core/channelsInterface";
import IPC from "./core/ipc";

const nameAPI = "testRunner";

// to Main
const validSendChannel: IChannels = { runTest: runTest };

const validInvokeChannel: IChannels = {};

// from Main
const validReceiveChannel: string[] = ["running-test", "finish"];

const testRunner = new IPC({
  nameAPI,
  validSendChannel,
  validInvokeChannel,
  validReceiveChannel,
});

export default testRunner;

async function runTest(browserWindow: BrowserWindow, event: Electron.IpcMainEvent, request: IRunTestRequest) {
  const { projFile, setting } = request;

  const storageFolder = path.join(StandardFolder.TestRuns, moment().format("YYYYMMDD_HHmmss"));
  let actionRs: IRunTestActionResult;
  const sb = new StringBuilder();

  // Main action
  try {
    // create storage folder first
    await fileSystem.createFoler(path.join(projFile.folderPath, storageFolder));

    // Copy .code-metadata file to test run folder of this run
    console.log("Copy '.code-metadata' file to test-result-storage folder");
    const srcMetadataFile = path.join(projFile.folderPath, StandardFolder.OutputCode, StandardOutputFile.MetaData);
    const copyMetadataTo = path.join(projFile.folderPath, storageFolder, StandardOutputFile.MetaData);
    fs.copyFileSync(srcMetadataFile, copyMetadataTo);

    // then, run test
    const context: IRunTestContext = {
      rmProjFile: projFile,
      storageFolder,
      settings: setting,
    };

    actionRs = await runTestInWorker(context, (event: IProgressEvent) => {
      const { type, ...details } = event;

      if (details.log) {
        sb.appendLine(details.log);
      }

      browserWindow.webContents.send(type, details as IProgressDetail);
    });
  } catch (error) {
    console.error(`runTest error: ${String(error)}`);
    actionRs = { isSuccess: false, errorMessage: String(error) };
  }

  console.log("Finish runTest", actionRs);

  const ipcRs: IIpcGenericResponse<IRunTestResponseData> = {
    isSuccess: actionRs.isSuccess,
    errorMessage: actionRs.errorMessage,
    data: {
      storageFolder: storageFolder,
      resultFileName: actionRs.data?.resultFileName,
    },
  };

  // Print log file
  try {
    sb.appendLine(`*** Finish at ${moment().format("MMMM Do YYYY, h:mm:ss a")}`);
    sb.appendLine(JSON.stringify(ipcRs, null, 4));

    const logFileName = `run-test.log`;
    const logFilePath = path.join(storageFolder, logFileName);
    await fileSystem.writeFile(path.join(projFile.folderPath, logFilePath), sb.toString());

    ipcRs.data = { ...ipcRs.data, logFileName: logFileName } as IRunTestResponseData;
  } finally {
    browserWindow.webContents.send("finish", ipcRs);
  }
}
