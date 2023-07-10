import { IRmProjFile } from "rockmelonqa.common";
import { parentPort } from "worker_threads";
import { doGenerateCode, doGenerateSourceProjectMetadata } from "./actions";
import { doBuildCode } from "./actions/buildCode";
import { doGenerateOutputProjectMetadata } from "./actions/generateOutputProjectMetadata";
import { doRunTest } from "./actions/runTest";
import { IRunTestContext } from "rockmelonqa.common/ipc-defs";

export enum WorkerAction {
  BuildCode = "BuildCode",
  GenCode = "GenCode",
  GenProjectMetadata = "GenProjectMetadata",
  GenOutputProjectMetadata = "GenOutputProjectMetadata",
  RunTest = "RunTest",
}

export type WorkerMessage =
  | { action: WorkerAction.GenCode; rmProjectFile: IRmProjFile }
  | { action: WorkerAction.GenProjectMetadata; rmProjectFile: IRmProjFile }
  | { action: WorkerAction.GenOutputProjectMetadata; rmProjectFile: IRmProjFile }
  | { action: WorkerAction.RunTest; context: IRunTestContext }
  | { action: WorkerAction.BuildCode; rmProjectFile: IRmProjFile };

parentPort?.on("message", async (msg: WorkerMessage) => {
  switch (msg.action) {
    case WorkerAction.GenCode:
      await doGenerateCode(parentPort, msg.rmProjectFile);
      return;
    case WorkerAction.GenProjectMetadata:
      await doGenerateSourceProjectMetadata(parentPort, msg.rmProjectFile);
      return;
    case WorkerAction.GenOutputProjectMetadata:
      await doGenerateOutputProjectMetadata(parentPort, msg.rmProjectFile);
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
