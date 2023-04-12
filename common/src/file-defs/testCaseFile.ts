import { IFileDef } from "./fileDef";
import { ITestStep } from "./testStep";

/** A test case is a collection of test steps */
export interface ITestCase {
  id: string;
  description: string;
  steps: ITestStep[];
}

/** Describes the file and its test case contents */
export interface ITestCaseFile extends Omit<IFileDef, "content"> {
  content: ITestCase;
}
