import { IRmProjFile } from "rockmelonqa.common";
import { parentPort } from "worker_threads";
import { doGenCode, doGenerateProjectMetadata } from "./actions";
import { doBuildCode } from "./actions/buildCode";
import { IRunTestContext, doRunTest } from "./actions/runTest";

export enum WorkerAction {
  BuildCode = "BuildCode",
  GenCode = "GenCode",
  GenProjectMetadata = "GenProjectMetadata",
  RunTest = "RunTest",
}

export type WorkerMessage =
  | { action: WorkerAction.GenCode; rmProjectFile: IRmProjFile }
  | { action: WorkerAction.GenProjectMetadata; rmProjectFile: IRmProjFile }
  | { action: WorkerAction.RunTest; context: IRunTestContext }
  | { action: WorkerAction.BuildCode; rmProjectFile: IRmProjFile };

parentPort?.on("message", async (msg: WorkerMessage) => {
  switch (msg.action) {
    case WorkerAction.GenCode:
      await doGenCode(parentPort, msg.rmProjectFile);
      return;
    case WorkerAction.GenProjectMetadata:
      await doGenerateProjectMetadata(parentPort, msg.rmProjectFile);
      return;
    case WorkerAction.BuildCode:
      await doBuildCode(parentPort, msg.rmProjectFile);
      return;
    case WorkerAction.RunTest:
      await doRunTest(parentPort, msg.context);
      return;
    default:
      // uknown type, do nothing
      return;
  }
});
