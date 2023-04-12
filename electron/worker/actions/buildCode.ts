import path from "path";
import { Worker } from "worker_threads";

import { execSync } from "child_process";
import { IProgressEvent, IRmProjFile, Language, StandardFolder } from "rockmelonqa.common";
import { MessagePort } from "worker_threads";
import * as fileSystem from "../../utils/fileSystem";
import { WorkerAction, WorkerMessage } from "../worker";
import { executeCommand, extractMajorMinorVersion, IActionResult } from "./shared";

export const buildCode = async function (
  rmProjectFile: IRmProjFile,
  progressNotify: (event: IProgressEvent) => void
): Promise<IActionResult> {
  return await new Promise<IActionResult>((rs, _) => {
    const workerPath = path.join(__dirname, "../worker.js");
    const worker = new Worker(workerPath);

    worker.on("message", (event: IProgressEvent) => {
      if (event.type === "finish") {
        rs({ isSuccess: true });
        return;
      }

      progressNotify({
        ...event,
        type: `build:${event.type}`,
      });
    });

    worker.on("error", (error: Error) => {
      console.error("Worker error:", error);
      rs({ isSuccess: false, errorMessage: String(error) });
    });

    worker.postMessage({
      action: WorkerAction.BuildCode,
      rmProjectFile: rmProjectFile,
    } as WorkerMessage);
  });
};

export const doBuildCode = async (port: MessagePort | null, rmProjectFile: IRmProjFile) => {
  const outputCodeFolder = path.join(rmProjectFile.folderPath, StandardFolder.OutputCode);
  const { language } = rmProjectFile.content;

  switch (language) {
    case Language.CSharp: {
      const cmd = "dotnet build";
      postMessage(port, { type: "build", log: `Executing: '${cmd}'` });

      const rs = executeCommand(cmd, { cwd: outputCodeFolder });
      if (rs.isSuccess) {
        postMessage(port, { type: "build", log: rs.output });
      } else {
        throw new Error(rs.output);
      }

      // Assume PowerShell is installed and available on the system PATH
      const dotnetVersion = execSync("dotnet --version").toString().trim();
      const scriptPath = path.join(
        outputCodeFolder,
        "bin",
        "Debug",
        `net${extractMajorMinorVersion(dotnetVersion)}`,
        "playwright.ps1"
      );
      if (await fileSystem.checkExists(scriptPath)) {
        const cmd = `pwsh ${scriptPath} install`;
        postMessage(port, { type: "install-dependencies", log: `Executing: '${cmd}'` });
        executeCommand(cmd);
        // dont show 'log' for this command
      }
      break;
    }
    case Language.Typescript: {
      const cmd = "npm install";
      postMessage(port, { type: "install-dependencies", log: `Executing: '${cmd}'` });
      const rs = executeCommand(cmd, { cwd: outputCodeFolder });
      postMessage(port, { type: "install-dependencies", log: rs.output });
      break;
    }
    default:
      // not support yet, do nothing
      break;
  }

  postMessage(port, { type: "finish" });
};

const postMessage = (port: MessagePort | null, event: IProgressEvent) => {
  port?.postMessage(event);
};
