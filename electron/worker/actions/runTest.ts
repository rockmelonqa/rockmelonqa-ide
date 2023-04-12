import path from "path";
import { Worker } from "worker_threads";

import { IProgressEvent, IRmProjFile, IRunTestSettings, Language, StandardFolder } from "rockmelonqa.common";
import { MessagePort } from "worker_threads";
import * as fileSystem from "../../utils/fileSystem";
import { WorkerAction, WorkerMessage } from "../worker";
import { executeCommand, IGenericActionResult } from "./shared";

export interface IRunTestContext {
  rmProjFile: IRmProjFile;
  settings: IRunTestSettings;
  storageFolder: string;
}

export type IRunTestActionResult = IGenericActionResult<{ resultFileName: string }>;

export const runTest = async function (
  context: IRunTestContext,
  progressNotify: (event: IProgressEvent) => void
): Promise<IRunTestActionResult> {
  return await new Promise<IRunTestActionResult>((rs, _) => {
    const workerPath = path.join(__dirname, "../worker.js");
    const worker = new Worker(workerPath);

    worker.on("message", (event: IProgressEvent) => {
      if (event.type === "finish") {
        rs(prepareActionRs(context, { isSuccess: true }));
      } else {
        progressNotify(event);
      }
    });

    worker.on("error", (error: Error) => {
      console.error(error);
      rs(prepareActionRs(context, { isSuccess: true, errorMessage: String(error) }));
    });

    worker.postMessage({
      action: WorkerAction.RunTest,
      context,
    } as WorkerMessage);
  });
};

const prepareActionRs = (context: IRunTestContext, actionRs: IRunTestActionResult): IRunTestActionResult => {
  const resultFileName = toResultFileName(context.rmProjFile);
  const fileSystemPath = path.join(context.rmProjFile.folderPath, context.storageFolder, resultFileName);

  // only return result-file-name if it does exist
  if (fileSystem.checkExistsSync(fileSystemPath)) {
    actionRs.data = { resultFileName: resultFileName };
  }

  return actionRs;
};

export const doRunTest = async (port: MessagePort | null, context: IRunTestContext) => {
  const { settings } = context;
  const { language } = context.rmProjFile.content;

  const resultFileName = toResultFileName(context.rmProjFile);
  const resultFilePath = path.join(context.storageFolder, resultFileName);
  let cmd: string;

  switch (language) {
    case Language.CSharp: {
      const filterStr = settings.dotnetFilterStr ? `--filter "${settings.dotnetFilterStr}"` : "";
      const browserStr = settings.browser
        ? `Playwright.BrowserName=${settings.browser}`
        : "Playwright.LaunchOptions.Headless=true";

      // See https://learn.microsoft.com/en-us/dotnet/core/tools/dotnet-test for more details about `dotnet test`
      // stand at 'output-code/bin' folder
      cmd = `dotnet test ${filterStr} -l:"trx;LogFileName=${`..${path.sep}..${path.sep}${resultFilePath}`}" -- ${browserStr}`;
      break;
    }
    case Language.Typescript: {
      // stand at 'output-code' folder
      cmd = `jest --json --outputFile=${`..${path.sep}${resultFilePath}`}`;
      break;
    }
    default:
      throw new Error("Language not supported: " + language);
  }

  postMessage(port, { type: "running-test", log: `Executing: '${cmd}'` });
  let outputCodeDir = path.join(context.rmProjFile.folderPath, StandardFolder.OutputCode);
  const rs = executeCommand(cmd, { cwd: outputCodeDir });
  postMessage(port, { type: "running-test", log: rs.output });

  postMessage(port, { type: "finish" });
};

const postMessage = (port: MessagePort | null, event: IProgressEvent) => {
  port?.postMessage(event);
};

const toResultFileName = (rmProjFile: IRmProjFile) => {
  const { language } = rmProjFile.content;
  switch (language) {
    case Language.CSharp:
      return "test-result.trx";
    case Language.Typescript:
      return "test-result.json";
    default:
      throw new Error("Language not supported: " + language);
  }
};
