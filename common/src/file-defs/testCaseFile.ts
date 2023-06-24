import { IFileDef } from "./fileDef";

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

export type ITestStep = ITestStepRegular | ITestStepComment;

export interface ITestStepBase {
  id: string;
  type: "";
}

export interface ITestStepRegular extends Omit<ITestStepBase, "type"> {
  type: "testStep";
  page?: string;
  element?: string;
  action?: string;
  data: string | { [datasetId: string]: string };
  parameters?: string[];
}
export interface ITestStepComment extends Omit<ITestStepBase, "type"> {
  type: "comment";
  comment?: string;
}
