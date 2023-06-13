import { IConfigurationFile } from "./configFile";
import { IPageFile } from "./pageFile";
import { IRmProjFile } from "./rmProjFile";
import { ITestCaseFile } from "./testCaseFile";
import { ITestRoutineFile } from "./testRoutineFile";
import { ITestSuiteFile } from "./testSuiteFile";

export interface ISourceProjectMetadata {
  configFiles: IConfigurationFile[];
  project: IRmProjFile;
  pages: IPageFile[];
  testRoutines: ITestRoutineFile[];
  testCases: ITestCaseFile[];
  testSuites: ITestSuiteFile[];
}
