import { IOutputProjectMetadata } from "../..";
import { ISourceProjectMeta } from "../../file-defs";
import { IPageInfo, ISuiteInfo, ITestCaseInfo } from "../types";
import { createMapForPages, createMapForTestCases, createMapForTestRoutines, createMapForTestSuites } from "./outProjMeta";

export const generateDotnetOutputProjectMeta = (projMeta: ISourceProjectMeta): IOutputProjectMetadata => {
  const rmprojFile = projMeta.project;
  const suites: ISuiteInfo[] = [];

  const pageMetaMap = createMapForPages(rmprojFile, projMeta.pages);
  const suiteMetaMap = createMapForTestSuites(rmprojFile, projMeta.testSuites);
  const caseMetaMap = createMapForTestCases(rmprojFile, projMeta.testCases);
  const routineMetaMap = createMapForTestRoutines(rmprojFile, projMeta.testRoutines);

  for (let { content: testsuite } of projMeta.testSuites) {
    let testCases = projMeta.testCases.filter((c) => testsuite.testcases.includes(c.content.id));
    let suiteMeta = suiteMetaMap.get(testsuite)!;

    let suiteInfo: ISuiteInfo = {
      name: suiteMeta.outputFileClassName,
      fullyQualifiedName: `${suiteMeta.outputFileFullNamespace}.${suiteMeta.outputFileClassName}`,
      inputFileName: suiteMeta.inputFileName,
      inputFilePath: suiteMeta.inputFilePath,
      inputFileRelPath: suiteMeta.inputFileRelPath,
      outputFileName: suiteMeta.outputFileName,
      outputFilePath: suiteMeta.outputFilePath,
      outputFileRelPath: suiteMeta.outputFileRelPath,
      isValid: suiteMeta.isValid,
      testCases: testCases.map((tc) => {
        let caseMeta = caseMetaMap.get(tc.content)!;
        let caseInfo: ITestCaseInfo = {
          name: caseMeta.outputFileClassName,
          fullyQualifiedName: `${suiteMeta.outputFileFullNamespace}.${suiteMeta.outputFileClassName}.${caseMeta.outputFileClassName}`,
          inputFileName: caseMeta.inputFileName,
          inputFilePath: caseMeta.inputFilePath,
          inputFileRelPath: caseMeta.inputFileRelPath,
          outputFileName: caseMeta.outputFileName,
          outputFilePath: caseMeta.outputFilePath,
          outputFileRelPath: caseMeta.outputFileRelPath,
          isValid: caseMeta.isValid,
        };
        return caseInfo;
      }),
    };
    suites.push(suiteInfo);
  }

  const cases: ITestCaseInfo[] = [];
  for (let { content: testcase, isValid } of projMeta.testCases) {
    let caseMeta = caseMetaMap.get(testcase)!;

    let caseInfo: ITestCaseInfo = {
      name: caseMeta.outputFileClassName,
      fullyQualifiedName: `${caseMeta.outputFileFullNamespace}.${caseMeta.outputFileClassName}`,
      inputFileName: caseMeta.inputFileName,
      inputFilePath: caseMeta.inputFilePath,
      inputFileRelPath: caseMeta.inputFileRelPath,
      outputFileName: caseMeta.outputFileName,
      outputFilePath: caseMeta.outputFilePath,
      outputFileRelPath: caseMeta.outputFileRelPath,
      isValid: caseMeta.isValid,
    };
    cases.push(caseInfo);
  }

  const pages: IPageInfo[] = [];
  for (let { content: page, isValid } of projMeta.pages) {
    let pageMeta = pageMetaMap.get(page)!;

    let pageInfo: IPageInfo = {
      name: pageMeta.outputFileClassName,
      fullyQualifiedName: `${pageMeta.outputFileFullNamespace}.${pageMeta.outputFileClassName}`,
      inputFileName: pageMeta.inputFileName,
      inputFilePath: pageMeta.inputFilePath,
      inputFileRelPath: pageMeta.inputFileRelPath,
      outputFileName: pageMeta.outputFileName,
      outputFilePath: pageMeta.outputFilePath,
      outputFileRelPath: pageMeta.outputFileRelPath,
      isValid: pageMeta.isValid,
    };
    pages.push(pageInfo);
  }

  return { suites, cases, pages };
};
