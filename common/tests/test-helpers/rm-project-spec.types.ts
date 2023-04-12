import { AutomationFramework, Indent, IRmProj, ITestStep, Language, LocatorType, TestFramework } from "../../src/file-defs";
import { IPageElement } from "../../src/file-defs/pageFile";

export interface RmpSpec {
  projectName: string;
  content: IRmProj;
  pages: IPage[];
  testcases: ITestCase[];
  testsuites: ITestSuite[];
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
  steps: ITestStep[];
}

export interface ITestSuite {
  id: string;
  name?: string;
  description: string;

  /** Guid refers to the test case guid */
  testcases: string[];
}
