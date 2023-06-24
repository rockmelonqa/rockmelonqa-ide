import { IFileDef } from "./fileDef";
import { IDictionary, ITestStepComment } from "./shared";
import { ITestStepCaseStep } from "./testCaseFile";

/** A data set is set of data to be used for a specific execution of a test routine   */
export interface IDataSet {
  id: string;
  name: string;
  description: string;
}

/** Test Routine is a sequence of test steps */
export interface ITestRoutine {
  id: string;
  description: string;
  steps: IRoutineStep[];
  dataSets: IDataSet[];
}

/** A step in a Routine */
export type IRoutineStep = ITestStepComment | ITestStepRoutine;

/** Describes the file and its test routine contents */
export interface ITestRoutineFile extends Omit<IFileDef, "content"> {
  content: ITestRoutine;
}

export interface ITestStepRoutine extends Omit<ITestStepCaseStep, "data"> {
  data: { [datasetId: string]: string };
}
