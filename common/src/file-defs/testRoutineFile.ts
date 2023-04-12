import { IFileDef } from "./fileDef";
import { ITestStep } from "./testStep";

/** A data set is set of data to be used for a specific execution of a test routine   */
export interface IDataSet {
  id: string;
  description: string;
}

/** Test Routine is a sequence of test steps */
export interface ITestRoutine {
  id: string;
  description: string;
  steps: ITestStep[];
  dataSets: IDataSet[];
}

/** Describes the file and its test routine contents */
export interface ITestRoutineFile extends Omit<IFileDef, "content"> {
  content: ITestRoutine;
}
