import { Browser, IRmProjFile } from "../file-defs";

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

export interface IRunTestSettings {
  browser: Browser;
  dotnetFilterStr: string;
}
