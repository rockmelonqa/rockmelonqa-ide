import { IPageInfo, ISuiteInfo, ITestCaseInfo } from "../types";

/** Contains meta data for output test suites */
export interface IOutputProjectMetadata {
  suites: ISuiteInfo[];
  cases: ITestCaseInfo[];
  pages: IPageInfo[];
  error?: { message: string };
}
