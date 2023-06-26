import { Browser, IRmProjFile } from "../file-defs";

/** Request object to run test */
export interface IRunTestRequest {
  projFile: IRmProjFile;
  setting: IRunTestSettings;
}

export interface IRunTestResponseData {
  /** Relative folder path, based on project folder path */
  storageFolder: string;
  logFileName?: string;
  resultFileName?: string;
}

/** Contains test run settings value, like browser, filters, ... */
export interface IRunTestSettings {
  /** The browser to launch: i.e Chrome, Firefox,... */
  browser: Browser;
  /** The string to use as `--filter` when running `dotnet test` command */
  dotnetFilterStr: string;
  /** Output directory */
  outputCodeDir: string;
  /** Relative path of the environment file being selected */
  environmentFile: string;
}
