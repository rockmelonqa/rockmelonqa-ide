import { profile } from 'console';
import { BrowserWindow } from 'electron';
import fs from 'fs';
import moment from 'moment';
import path from 'path';
import { IIpcGenericResponse, IProgressDetail, IProgressEvent, StandardFolder } from 'rockmelonqa.common';
import { IRmProjFile, Language, StandardOutputFile } from 'rockmelonqa.common/file-defs';
import { IRunTestRequest, IRunTestResponseData } from 'rockmelonqa.common/ipc-defs';
import * as fileSystem from '../utils/fileSystem';
import { StringBuilder } from '../utils/stringBuilder';
import { IRunTestActionResult, IRunTestContext, runTest as runTestInWorker } from '../worker/actions/runTest';
import { IChannels } from './core/channelsInterface';
import IPC from './core/ipc';

const nameAPI = 'testRunner';

// to Main
const validSendChannel: IChannels = { runTest: runTest };

const validInvokeChannel: IChannels = {};

// from Main
const validReceiveChannel: string[] = ['running-test', 'finish'];

const testRunner = new IPC({
  nameAPI,
  validSendChannel,
  validInvokeChannel,
  validReceiveChannel,
});

export default testRunner;

async function runTest(browserWindow: BrowserWindow, event: Electron.IpcMainEvent, request: IRunTestRequest) {
  const { projFile, browser, environmentFile, testCases } = request;
  const context: IRunTestContext = {
    rmProjFile: projFile,
    settings: {
      sourceCodeFolderPath: path.join(projFile.folderPath, StandardFolder.OutputCode),
      testResultFolderRelPath: path.join(StandardFolder.TestRuns, moment().format('YYYYMMDD_HHmmss')),
      testResultFileName: toTestResultFileName(projFile),
      browser,
      environmentFile,
      filter: testCases.map(x => x.fullyQualifiedName).join("|"),
    },
  };

  let actionRs: IRunTestActionResult;
  const sb = new StringBuilder();

  // Main action
  try {
    // ensure test-result folder exists
    await fileSystem.createFolder(path.join(projFile.folderPath, context.settings.testResultFolderRelPath));

    // Copy .code-metadata file to test run folder of this run
    console.log("Copy '.code-metadata' file to test-result folder");
    fs.copyFileSync(
      path.join(context.settings.sourceCodeFolderPath, StandardOutputFile.MetaData), 
      path.join(projFile.folderPath, context.settings.testResultFolderRelPath, StandardOutputFile.MetaData));    

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

  console.log('Finish runTest', actionRs);

  const ipcRs: IIpcGenericResponse<IRunTestResponseData> = {
    isSuccess: actionRs.isSuccess,
    errorMessage: actionRs.errorMessage,
    data: {
      storageFolder: context.settings.testResultFolderRelPath,
      resultFileName: await hasTestResultFile(path.join(
        context.rmProjFile.folderPath,
        context.settings.testResultFolderRelPath,
        context.settings.testResultFileName)) ? context.settings.testResultFileName : undefined,
    },
  };

  // Print log file
  try {
    sb.appendLine(`*** Finish at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`);
    sb.appendLine(JSON.stringify(ipcRs, null, 4));

    const logFileName = `run-test.log`;
    const logFilePath = path.join(context.settings.testResultFolderRelPath, logFileName);
    await fileSystem.writeFile(path.join(projFile.folderPath, logFilePath), sb.toString());

    ipcRs.data = { ...ipcRs.data, logFileName: logFileName } as IRunTestResponseData;
  } finally {
    browserWindow.webContents.send('finish', ipcRs);
  }
}

const toTestResultFileName = (rmProjFile: IRmProjFile) => {
  const { language } = rmProjFile.content;
  switch (language) {
      case Language.CSharp:
          return 'test-result.trx';
      case Language.Typescript:
          return 'test-result.json';
      default:
          throw new Error('Language not supported: ' + language);
  }
};

const hasTestResultFile = async (testResultFileRelPath: string) => {
  return await fileSystem.checkExists(testResultFileRelPath);
}