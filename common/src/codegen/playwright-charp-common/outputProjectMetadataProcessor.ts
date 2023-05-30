import { IRmProjFile, ITestCase, ITestCaseFile, ITestRoutine, ITestRoutineFile, ITestSuite, ITestSuiteFile } from "../../file-defs";
import { IPage, IPageFile } from "../../file-defs/pageFile";
import { IOutputFileInfo, IOutputProjectMetadata } from "../types";
import { createOutputFileInfo } from "./createOutputFileInfo";

/** For generating output project metadata */
export interface IOutputProjectMetadataProcessor {
  createOutputProjectMetadata: () => IOutputProjectMetadata;
  get: (guid: string) => IOutputFileInfo;
}

/** Creates Map with the Page as keys and Output File Infor as values */
export const createMapForPages = (proj: IRmProjFile, pageFiles: IPageFile[]): Map<IPage, IOutputFileInfo> => {
  const map = new Map<IPage, IOutputFileInfo>();

  for (let pageFile of pageFiles) {
    const nameInfo = createOutputFileInfo(pageFile, proj);
    map.set(pageFile.content, nameInfo);
  }

  return map;
};

/** Creates Map with the TestCase as keys and Output File Infor as values */
export const createMapForTestCases = (proj: IRmProjFile, testCaseFiles: ITestCaseFile[]): Map<ITestCase, IOutputFileInfo> => {
  const map = new Map<ITestCase, IOutputFileInfo>();

  for (let testCaseFile of testCaseFiles) {
    const nameInfo = createOutputFileInfo(testCaseFile, proj);
    map.set(testCaseFile.content, nameInfo);
  }

  return map;
};

/** Creates Map with the Test Suite as keys and Output File Infor as values */
export const createMapForTestSuites = (proj: IRmProjFile, testSuiteFiles: ITestSuiteFile[]): Map<ITestSuite, IOutputFileInfo> => {
  const map = new Map<ITestSuite, IOutputFileInfo>();

  for (let testSuiteFile of testSuiteFiles) {
    const nameInfo = createOutputFileInfo(testSuiteFile, proj);
    map.set(testSuiteFile.content, nameInfo);
  }

  return map;
};

/** Creates Map with the Test Routine as keys and Output File Infor as values */
export const createMapForTestRoutines = (proj: IRmProjFile, testRoutineFiles: ITestRoutineFile[]): Map<ITestRoutine, IOutputFileInfo> => {
  const map = new Map<ITestRoutine, IOutputFileInfo>();

  for (let testRoutineFile of testRoutineFiles) {
    const nameInfo = createOutputFileInfo(testRoutineFile, proj);
    map.set(testRoutineFile.content, nameInfo);
  }

  return map;
};
