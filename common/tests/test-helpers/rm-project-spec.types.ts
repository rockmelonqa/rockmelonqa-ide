import { AutomationFramework, Indent, IRmProj, ITestCaseStep, Language, LocatorType, TestFramework } from "../../src/file-defs";
import { IPageElement } from "../../src/file-defs/pageFile";

export interface RmpSpec {
  projectName: string;
  content: IRmProj;
  pages: IPage[];
  testcases: ITestCase[];
  testsuites: ITestSuite[];
  testroutines: ITestRoutine[];
  outputFiles?: OutputCodeFile[];
}

export interface OutputCodeFile {
  fileRelPath: string;
  fileContent: string;
}

export interface IPage {
  id: string;
  name?: string;
  description?: string;
  elements: IPageElement[];
}

export interface ITestCase {
  id: string;
  name?: string;
  description: string;
  steps: ITestCaseStep[];
}

export interface ITestRoutine {
  id: string;
  name?: string;
  description: string;
  steps: ITestCaseStep[];
  dataSets: { id: string; name: string; description: string }[];
}

export interface ITestSuite {
  id: string;
  name?: string;
  description: string;

  /** Guid refers to the test case guid */
  testcases: string[];
}
