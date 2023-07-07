import path from "path";
import { Worker } from "worker_threads";

import { IProgressEvent, IRmProjFile, Language } from "rockmelonqa.common";
import { MessagePort } from "worker_threads";
import * as fileSystem from "../../utils/fileSystem";
import { WorkerAction, WorkerMessage } from "../worker";
import { executeCommand, IGenericActionResult } from "./shared";
import { CommandBuilderFactory } from "./runTest/commandBuilder";
import { Browser } from "rockmelonqa.common/file-defs";
import { ITestCaseInfo } from "rockmelonqa.common/codegen/types";
import { IRunTestContext } from "rockmelonqa.common/ipc-defs";

export type IRunTestActionResult = IGenericActionResult<{}>;

export const runTest = async function (
  context: IRunTestContext,
  progressNotify: (event: IProgressEvent) => void
): Promise<IRunTestActionResult> {
  return await new Promise<IRunTestActionResult>((rs, _) => {
    const workerPath = path.join(__dirname, "../worker.js");
    const worker = new Worker(workerPath);

    worker.on("message", (event: IProgressEvent) => {
      if (event.type === "finish") {
        rs({ isSuccess: true });
      } else {
        progressNotify(event);
      }
    });

    worker.on("error", async (error: Error) => {
      console.error(error);
      rs({ isSuccess: false, errorMessage: String(error) });
    });

    worker.postMessage({
      action: WorkerAction.RunTest,
      context,
    } as WorkerMessage);
  });
};

export const doRunTest = async (port: MessagePort | null, context: IRunTestContext) => {
  const { settings } = context;
  const { language, testFramework } = context.rmProjFile.content;

  let commandBuilder = CommandBuilderFactory.getBuilder(language, testFramework);
  let cmd: string = commandBuilder.build(settings);

  postMessage(port, { type: "running-test", log: `Executing: '${cmd}'` });
  const rs = executeCommand(cmd, { cwd: settings.sourceCodeFolderPath });
  postMessage(port, { type: "running-test", log: rs.output });

  postMessage(port, { type: "finish" });
};

const postMessage = (port: MessagePort | null, event: IProgressEvent) => {
  port?.postMessage(event);
};
