import { IFileDef } from "./fileDef";
import { ITestActionStep, ITestStepBase, ITestStepComment } from "./shared";

/** A test case is a collection of test steps */
export interface ITestCase {
  id: string;
  description: string;
  steps: ITestCaseStep[];
}

export type ITestCaseStep = ITestCaseActionStep | ITestStepComment;

/** Describes the file and its test case contents */
export interface ITestCaseFile extends Omit<IFileDef, "content"> {
  content: ITestCase;
}

/** An action step in a test case */
export interface ITestCaseActionStep extends Omit<ITestActionStep, "data"> {
  data: string;
}
