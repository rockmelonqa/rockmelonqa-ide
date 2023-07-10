import { Browser, IRmProjFile } from "../file-defs";
import { ITestCaseInfo } from "../codegen/types";

/** Request object to run test */
export interface IRunTestRequest {
  /** Project to run test */
  projFile: IRmProjFile;

  /** The browser to launch: i.e Chrome, Firefox,... */
  browser: Browser;

  /** Relative path of the environment file being selected */
  environmentFile: string;

  testCases: ITestCaseInfo[];
}

export interface IRunTestResponseData {
  /** Relative folder path, based on project folder path */
  storageFolder: string;
  logFileName?: string;
  resultFileName?: string;
}

export interface IRunTestContext {
  rmProjFile: IRmProjFile;
  settings: IRunTestSettings;
}

export interface IRunTestSettings {
  /** Path to source code folder */
  sourceCodeFolderPath: string;

  /** Relative path to test result storage folder */
  testResultFolderRelPath: string;
  /** Test-result file name (stored at test-result folder) */
  testResultFileName: string;

  /** The browser to launch: i.e Chrome, Firefox,... */
  browser: Browser;
  /** Relative path of the environment file being selected */
  environmentFile: string;

  testCases: ITestCaseInfo[];
}
