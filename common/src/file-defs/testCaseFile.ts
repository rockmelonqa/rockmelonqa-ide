import { IFileDef } from "./fileDef";
import { ITestStepBase, ITestStepComment } from "./shared";

/** A test case is a collection of test steps */
export interface ITestCase {
  id: string;
  description: string;
  steps: ITestCaseStep[];
}

export type ITestCaseStep = ITestStepCaseStep | ITestStepComment;

/** Describes the file and its test case contents */
export interface ITestCaseFile extends Omit<IFileDef, "content"> {
  content: ITestCase;
}

export interface ITestStepCaseStep extends Omit<ITestStepBase, "type"> {
  type: "testStep";
  page?: string;
  element?: string;
  action?: string;
  data: string;
  parameters?: string[];
}
