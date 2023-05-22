import { IFileDef } from "./fileDef";
import { IDictionary } from "./shared";

/** A data set is set of data to be used for a specific execution of a test routine   */
export interface IDataSet {
  id: string;
  description: string;
}

/** Test Routine is a sequence of test steps */
export interface ITestRoutine {
  id: string;
  description: string;
  steps: ITestRoutineStep[];
  dataSets: IDataSet[];
}

/** Describes the file and its test routine contents */
export interface ITestRoutineFile extends Omit<IFileDef, "content"> {
  content: ITestRoutine;
}

export interface ITestRoutineStep {
  id: string;
  type: "testStep" | "comment";
  page?: string;
  element?: string;
  action?: string;
  data: IDictionary<string>[];
  parameters?: string[];
  comment?: string;
}
