import type { LocatorType } from "rockmelonqa.common";
import type { IDictionary } from "rockmelonqa.common/file-defs/shared";

export interface IPageElementData {
    id: string;
    name?: string;
    findBy?: LocatorType;
    locator?: string;
}

export interface IPageData {
    id: string;
    name: string;
    elements: Map<string, IPageElementData>;
    filePath: string;
}

export interface ITestCaseData {
    id: string;
    name: string;
    steps: ITestCaseStepData[];
    filePath: string;
}

export type ITestCaseStepData = ITestCaseStepRegularData | ITestCaseStepRoutineData;

interface ITestCaseStepBase {
  id: string;
  type: "";
}

export interface ITestCaseStepRegularData extends Omit<ITestCaseStepBase, "type"> {
  type: "testStep";
  page?: string;
  element?: string;
  action?: string;
  data: string | { [datasetId: string]: string };
}

export interface ITestCaseStepRoutineData extends Omit<ITestCaseStepBase, "type"> {
  type: "routine";
  routine?: string;
  dataset?: string;
}

export interface ITestRoutineData {
    id: string;
    name: string;
    steps: ITestRoutineStepData[];
    filePath: string;
}

export interface ITestRoutineStepData {
  id: string;
  page?: string;
  element?: string;
  action?: string;
  data: IDictionary<string>;
}

export interface ITestSuiteData {
  id: string;
  name: string;
  testcases: string[];
  filePath: string;
}
