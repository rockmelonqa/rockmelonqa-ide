import { IFileDef } from "./fileDef";
import { IDictionary, ITestActionStep, ITestStepComment } from "./shared";
import { ITestCaseActionStep } from "./testCaseFile";

/** A data set is set of data to be used for a specific execution of a test routine   */
export interface IDataSet {
  id: string;
  name: string;
  description: string;
}

/** Describes the file and its test routine contents */
export interface ITestRoutineFile extends Omit<IFileDef, "content"> {
  content: ITestRoutine;
}

/** Test Routine is a sequence of test steps */
export interface ITestRoutine {
  id: string;
  description: string;
  steps: IRoutineStep[];
  dataSets: IDataSet[];
}

/** A step in a Routine */
export type IRoutineStep = ITestStepComment | ITestRoutineActionStep;

/** An Action step in a routine */
export interface ITestRoutineActionStep extends Omit<ITestActionStep, "data"> {
  data: { [datasetId: string]: string };
}
