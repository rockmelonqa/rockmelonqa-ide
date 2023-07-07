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

    testCases: ITestCaseInfo[]
}

export interface IRunTestResponseData {
    /** Relative folder path, based on project folder path */
    storageFolder: string;
    logFileName?: string;
    resultFileName?: string;
}
