import { ActionType, LocatorType } from "../file-defs";
import { IProgressEvent } from "../ipc-defs";

/** Action data type indicator */
export enum ActionDataType {
  /** Indicates that the data string is a literal value: string, number, boolean ... */
  LiteralValue = "LiteralValue",
  /** Indicates that the data string is a Environment variable notation, e.g {TestUser}, {TestPassword}*/
  EnvironmentVar = "EnvironmentVar",
}

/** Wrapper for action data */
export interface IActionData {
  /** The actual data being wrapped */
  rawData: any;
  /** Data type */
  dataType: ActionDataType;
}

export interface ICodeGen {
  generateCode: (full: boolean, writeFile: (path: string, content: string) => Promise<void>) => Promise<string>;
}

/** Progress event callback function */
export type ProgressEventCallback = (event: IProgressEvent) => void;

/** Write File function */
export type WriteFileFn = (path: string, content: string) => Promise<void>;

/** Wrapper for the parameters needed to generate code for an Action */
export interface IActionTemplateParam {
  pageName: string;
  elementName: string;
  action: ActionType;
  data: IActionData;
  parameters: string[];
}

/** Wrapper for the parameters needed to generate code for a Locator */
export interface ILocatorTemplateParam {
  elementName: string;
  locatorStr: string;
  locatorType: LocatorType;
  description: string;
  hasParams?: boolean;
  returnedLocatorType: ReturnedLocatorType;
}

/** Metadata of a test suite */
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

/** Metadata of a test case */
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
  /** The file relative path of the test suite (spec). Used for playwright to build test filter */
  constainerSuiteFileRelPath: string;
  /** Line number of the test method inside the test suite (spec). Used for playwright to build test filter */
  lineNumber?: number;
}

/** Metadata of a test routine */
export interface ITestRoutineInfo {
  name: string;
  fullyQualifiedName: string;
  inputFileName: string;
  inputFilePath: string;
  inputFileRelPath: string;
  outputFileName: string;
  outputFilePath: string;
  outputFileRelPath: string;
  isValid: boolean;
  /** Line number of the test method inside the test suite (spec). Used for playwright to build test filter */
  lineNumber?: number;
}

/** Metadata of a page */
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

/** Metadata of the env file */
export interface IEnvironmentFileInfo {
  name: string;
  inputFileName: string;
  inputFilePath: string;
  inputFileRelPath: string;
  outputFileName: string;
  outputFilePath: string;
  outputFileRelPath: string;
  isValid: boolean;
}

/** Contains metadata of an output file */
export interface IOutputFileInfo {
  /** Input file name without extension */
  inputFileName: string;
  /** Input file name extension */
  inputFileExt: string;
  /** Full input file path */
  inputFilePath: string;
  /** File path relative to the  "standand input folder" ("test-cases", "test-suites", etc...), not the project root path */
  inputFileRelPath: string;
  /** Output file name with only a-A0-9 chars */
  outputFileCleanName: string;
  /** Output file name WITH extension */
  outputFileName: string;
  /** Output file full path */
  outputFilePath: string;
  /** Output file relatative path. Relative to the "output-code" folder */
  outputFileRelPath: string;
  /** Class name of the output file (class) */
  outputFileClassName: string;

  /** The part of the namespace after the RootNamespace */
  outputFileSubNamespace: string;
  /** The full namespace of the class */
  outputFileFullNamespace: string;
  /** Indicates that the input file is valid and so the ouput file should be also valid */
  isValid: boolean;
}

/** Contains meta data for output project */
export interface IOutputProjectMetadata {
  suites: ISuiteInfo[];
  cases: ITestCaseInfo[];
  routines: ITestRoutineInfo[];
  pages: IPageInfo[];
  environments: IEnvironmentFileInfo[];
  error?: { message: string; data?: string };
}

/** Locator return type. For dotnet: `"IFrameLocator"` and `"ILocator"`; for typescript: `"FrameLocator"` and `"Locator"` */
export type ReturnedLocatorType = "IFrameLocator" | "ILocator" | "FrameLocator" | "Locator";
