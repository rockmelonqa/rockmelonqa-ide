import { ActionType, LocatorType } from "../file-defs";

export interface ICodeGen {
  generateCode: (full: boolean, writeFile: (path: string, content: string) => Promise<void>) => Promise<string>;
}

export interface IActionTemplateParam {
  pageName: string;
  elementName: string;
  action: ActionType;
  data: string;
  parameters: string[];
}

export interface ILocatorTemplateParam {
  elementName: string;
  locatorStr: string;
  locatorType: LocatorType;
  description: string;
  hasParams?: boolean;
  returnedLocatorType: ReturnedLocatorType;
}

export interface ISuiteInfo {
  name: string;
  fullyQualifiedName: string;
  inputFileName: string;
  inputFilePath: string;
  inputFileRelPath: string;
  outputFileName: string;
  outputFilePath: string;
  outputFileRelPath: string;
  testCases: ITestCaseInfo[];
  /** Suite file can be invalid because it is empty or the JSON content is modified manually and cannot be parsed */
  isValid: boolean;
}

export interface ITestCaseInfo {
  name: string;
  fullyQualifiedName: string;
  inputFileName: string;
  inputFilePath: string;
  inputFileRelPath: string;
  outputFileName: string;
  outputFilePath: string;
  outputFileRelPath: string;
  isValid: boolean;
}

export interface IPageInfo {
  name: string;
  fullyQualifiedName: string;
  inputFileName: string;
  inputFilePath: string;
  inputFileRelPath: string;
  outputFileName: string;
  outputFilePath: string;
  outputFileRelPath: string;
  isValid: boolean;
}

export interface IOutputFileFileInfo {
  inputFileName: string;
  inputFilePath: string;
  inputFileRelPath: string;
  outputFileCleanName: string;
  outputFileName: string;
  outputFilePath: string;
  outputFileRelPath: string;
  outputFileClassName: string;
  outputFileSubNamespace: string;
  outputFileFullNamespace: string;
  isValid: boolean;
}

export type ReturnedLocatorType = "IFrameLocator" | "ILocator" | "FrameLocator" | "Locator";
