import { IRmProjFile, ITestCase, ITestCaseFile, ITestRoutine, ITestRoutineFile, ITestSuite, ITestSuiteFile } from "../../file-defs";
import { IPage, IPageFile } from "../../file-defs/pageFile";
import { IOutputFileFileInfo } from "../types";
import { createCsharpFileMeta } from "./createCsharpFileMeta";
import { IOutputProjectMetadata } from "./outputProjectMetadata";

export interface IOutProjMeta {
  createSuitesMeta: () => IOutputProjectMetadata;
}

export const createMapForPages = (proj: IRmProjFile, pageFiles: IPageFile[]): Map<IPage, IOutputFileFileInfo> => {
  const map = new Map<IPage, IOutputFileFileInfo>();

  for (let pageFile of pageFiles) {
    const nameInfo = createCsharpFileMeta(pageFile, proj);
    map.set(pageFile.content, nameInfo);
  }

  return map;
};

export const createMapForTestCases = (proj: IRmProjFile, testCaseFiles: ITestCaseFile[]): Map<ITestCase, IOutputFileFileInfo> => {
  const map = new Map<ITestCase, IOutputFileFileInfo>();

  for (let testCaseFile of testCaseFiles) {
    const nameInfo = createCsharpFileMeta(testCaseFile, proj);
    map.set(testCaseFile.content, nameInfo);
  }

  return map;
};

export const createMapForTestSuites = (proj: IRmProjFile, testSuiteFiles: ITestSuiteFile[]): Map<ITestSuite, IOutputFileFileInfo> => {
  const map = new Map<ITestSuite, IOutputFileFileInfo>();

  for (let testSuiteFile of testSuiteFiles) {
    const nameInfo = createCsharpFileMeta(testSuiteFile, proj);
    map.set(testSuiteFile.content, nameInfo);
  }

  return map;
};

export const createMapForTestRoutines = (
  proj: IRmProjFile,
  testRoutineFiles: ITestRoutineFile[]
): Map<ITestRoutine, IOutputFileFileInfo> => {
  const map = new Map<ITestRoutine, IOutputFileFileInfo>();

  for (let testRoutineFile of testRoutineFiles) {
    const nameInfo = createCsharpFileMeta(testRoutineFile, proj);
    map.set(testRoutineFile.content, nameInfo);
  }

  return map;
};
