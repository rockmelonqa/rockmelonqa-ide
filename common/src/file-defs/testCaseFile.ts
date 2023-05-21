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

export interface ITestStep {
  id: string;
  type: "testStep" | "comment" | "routine";
  routine?: string;
  dataset?: string;
  page?: string;
  element?: string;
  action?: string;
  data?: string;
  parameters?: string[];
  comment?: string;
}
