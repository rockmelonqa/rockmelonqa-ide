import { ISourceProjectMetadata, ITestCase, ITestRoutine, ITestSuite } from "../../file-defs";
import { IPage } from "../../file-defs/pageFile";
import {
  IEnvironmentFileInfo,
  IOutputFileInfo,
  IOutputProjectMetadata,
  IPageInfo,
  ISuiteInfo,
  ITestCaseInfo,
} from "../types";
import { MapCreator } from "./outputProjectMetadataProcessor";

export class DotnetTestProjectMetaGenerator {
  private projMeta: ISourceProjectMetadata;

  public readonly pageMetaMap: Map<IPage, IOutputFileInfo> = new Map<IPage, IOutputFileInfo>();
  public readonly suiteMetaMap: Map<ITestSuite, IOutputFileInfo> = new Map<ITestSuite, IOutputFileInfo>();
  public readonly caseMetaMap: Map<ITestCase, IOutputFileInfo> = new Map<ITestCase, IOutputFileInfo>();
  public readonly routineMetaMap: Map<ITestRoutine, IOutputFileInfo> = new Map<ITestRoutine, IOutputFileInfo>();

  constructor(projMeta: ISourceProjectMetadata) {
    this.projMeta = projMeta;
    const rmprojFile = projMeta.project;
    const mapCreator: MapCreator = new MapCreator(rmprojFile);

    this.pageMetaMap = mapCreator.createMapForPages(rmprojFile, projMeta.pages);
    this.suiteMetaMap = mapCreator.createMapForTestSuites(rmprojFile, projMeta.testSuites);
    this.caseMetaMap = mapCreator.createMapForTestCases(rmprojFile, projMeta.testCases);
    this.routineMetaMap = mapCreator.createMapForTestRoutines(rmprojFile, projMeta.testRoutines);

    this.verifyDuplication();
  }

  private verifyDuplication() {
    this.findDuplication(this.pageMetaMap.values());
    this.findDuplication(this.caseMetaMap.values());
    this.findDuplication(this.suiteMetaMap.values());
    this.findDuplication(this.routineMetaMap.values());
  }

  private findDuplication(nameInfo: IterableIterator<IOutputFileInfo>) {
    const allFilePath = Array.from(nameInfo).map((x) => x.outputFilePath);
    const firstDuplication = allFilePath.find((x) => allFilePath.indexOf(x) !== allFilePath.lastIndexOf(x));
    if (firstDuplication) {
      //throw new Error(`Duplicate output file: ${firstDuplication}`);
      console.error(`Duplicate output file: ${firstDuplication}`);
    }
  }

  public createDotnetProjectMetadata(): IOutputProjectMetadata {
    const rmprojFile = this.projMeta.project;
    const suites: ISuiteInfo[] = [];
    const environments: IEnvironmentFileInfo[] = [];

    const mapCreator: MapCreator = new MapCreator(rmprojFile);

    const environmentFileMetaMap = mapCreator.createMapForEnvironmentFiles(rmprojFile, this.projMeta.environmentFiles);
    const pageMetaMap = mapCreator.createMapForPages(rmprojFile, this.projMeta.pages);
    const suiteMetaMap = mapCreator.createMapForTestSuites(rmprojFile, this.projMeta.testSuites);
    const caseMetaMap = mapCreator.createMapForTestCases(rmprojFile, this.projMeta.testCases);
    const routineMetaMap = mapCreator.createMapForTestRoutines(rmprojFile, this.projMeta.testRoutines);

    for (let { content: environmentContent } of this.projMeta.environmentFiles) {
      let envMeta = environmentFileMetaMap.get(environmentContent)!;

      let envInfo: IEnvironmentFileInfo = {
        name: envMeta.outputFileClassName,
        inputFileName: envMeta.inputFileName,
        inputFilePath: envMeta.inputFilePath,
        inputFileRelPath: envMeta.inputFileRelPath,
        outputFileName: envMeta.outputFileName,
        outputFilePath: envMeta.outputFilePath,
        outputFileRelPath: envMeta.outputFileRelPath,
        isValid: envMeta.isValid,
      };
      environments.push(envInfo);
    }

    for (let { content: testsuite } of this.projMeta.testSuites) {
      let testCases = this.projMeta.testCases.filter((c) => testsuite.testcases.includes(c.content.id));
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
            constainerSuiteFileRelPath: suiteMeta.outputFileRelPath,
            isValid: caseMeta.isValid,
          };
          return caseInfo;
        }),
      };
      suites.push(suiteInfo);
    }

    const cases: ITestCaseInfo[] = [];
    for (let { content: testcase, isValid } of this.projMeta.testCases) {
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
        constainerSuiteFileRelPath: "",
        isValid: caseMeta.isValid,
      };
      cases.push(caseInfo);
    }

    const pages: IPageInfo[] = [];
    for (let { content: page, isValid } of this.projMeta.pages) {
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

    return { suites, cases, pages, environments };
  }

  /** Get an instance of IOutputFileInfo with the provided guid of an item in the rmProj  */
  public get(guid: string): IOutputFileInfo {
    // IPage
    for (let [page, info] of this.pageMetaMap) {
      if (page.id === guid) {
        return info;
      }
    }
    // ITestRoutine
    for (let [suite, info] of this.suiteMetaMap) {
      if (suite.id === guid) {
        return info;
      }
    }
    // TCase
    for (let [tcase, info] of this.caseMetaMap) {
      if (tcase.id === guid) {
        return info;
      }
    }
    // ITestRoutine
    for (let [routine, info] of this.routineMetaMap) {
      if (routine.id === guid) {
        return info;
      }
    }
    throw new Error(`NameMap doesn't contain a complete set of names.`);
  }
}
