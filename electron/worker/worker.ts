import { IRmProjFile } from "rockmelonqa.common";
import { parentPort } from "worker_threads";
import { doGenCode } from "./actions";
import { doBuildCode } from "./actions/buildCode";
import { doRunTest, IRunTestContext } from "./actions/runTest";

export enum WorkerAction {
  BuildCode = "BuildCode",
  GenCode = "GenCode",
  RunTest = "RunTest",
}

export type WorkerMessage =
  | { action: WorkerAction.GenCode; rmProjectFile: IRmProjFile }
  | { action: WorkerAction.RunTest; context: IRunTestContext }
  | { action: WorkerAction.BuildCode; rmProjectFile: IRmProjFile };

parentPort?.on("message", async (msg: WorkerMessage) => {
  switch (msg.action) {
    case WorkerAction.GenCode:
      await doGenCode(parentPort, msg.rmProjectFile);
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
