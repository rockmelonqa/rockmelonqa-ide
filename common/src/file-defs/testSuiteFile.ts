import { IFileDef } from "./fileDef";

/** A test suite is a sequence of test cases to be run */
export interface ITestSuite {
  id: string;
  description: string;

  /** Guid refers to the test case guid */
  testcases: string[];
}

/** Describes the file and its test suite contents */
export interface ITestSuiteFile extends Omit<IFileDef, "content"> {
  content: ITestSuite;
}
