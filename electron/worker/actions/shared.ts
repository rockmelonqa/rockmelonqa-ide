import { execSync, ExecSyncOptions } from "child_process";
import os from "os";

export interface IGenericActionResult<T> {
  isSuccess: boolean;
  errorMessage?: string;
  data?: T;
}

export type IActionResult = IGenericActionResult<any>;

export function executeCommand(cmd: string, options?: ExecSyncOptions): IExecuteCommandResponse {
  options && (options.stdio = "pipe");
  console.log(`Executing: '${cmd}'.`);

  try {
    const output = execSync(cmd, options);
    console.log(`Executed: '${cmd}'.`);

    return { isSuccess: true, output: output.toString().trim() };
  } catch (err: any) {
    return {
      isSuccess: false,
      output: `Command "${cmd}" failed: ${os.EOL}${err.stdout.toString()}`,
    };
  }
}

export interface IExecuteCommandResponse {
  isSuccess: boolean;
  output?: string;
}

/**
 * Get `major.minor` info from full version `major.minor.build.revision`
 */
export function extractMajorMinorVersion(version: string): string {
  const majorMinorRegex = /^(\d+\.\d+)/;
  const matches = version.match(majorMinorRegex);
  return matches ? matches[1] : "";
}
