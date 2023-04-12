import { ICodeGenMeta, ITestCase, ITestRoutine, ITestSuite } from "../../file-defs";
import { IPage } from "../../file-defs/pageFile";
import {
  createMapForPages,
  createMapForTestCases,
  createMapForTestRoutines,
  createMapForTestSuites,
  IOutProjMeta,
} from "../playwright-charp/outProjMeta";
import { ITestSuitesMetadata } from "../playwright-charp/testSuiteMetadata";
import { IOutputFileFileInfo, ISuiteInfo, ITestCaseInfo } from "../types";

export class NunitProjectMeta implements IOutProjMeta {
  private _projMeta: ICodeGenMeta;

  public readonly pageNameMap: Map<IPage, IOutputFileFileInfo> = new Map<IPage, IOutputFileFileInfo>();
  public readonly suiteNameMap: Map<ITestSuite, IOutputFileFileInfo> = new Map<ITestSuite, IOutputFileFileInfo>();
  public readonly caseNameMap: Map<ITestCase, IOutputFileFileInfo> = new Map<ITestCase, IOutputFileFileInfo>();
  public readonly routineNameMap: Map<ITestRoutine, IOutputFileFileInfo> = new Map<ITestRoutine, IOutputFileFileInfo>();

  /**
   *
   */
  constructor(codegenMeta: ICodeGenMeta) {
    this._projMeta = codegenMeta;
    const rmprojFile = codegenMeta.project;

    this.pageNameMap = createMapForPages(rmprojFile, codegenMeta.pages);
    this.suiteNameMap = createMapForTestSuites(rmprojFile, codegenMeta.testSuites);
    this.caseNameMap = createMapForTestCases(rmprojFile, codegenMeta.testCases);
    this.routineNameMap = createMapForTestRoutines(rmprojFile, codegenMeta.testRoutines);
  }

  public createSuitesMeta(): ITestSuitesMetadata {
    const suites: ISuiteInfo[] = [];

    for (let { content: testsuite, isValid } of this._projMeta.testSuites) {
      let testCases = this._projMeta.testCases.filter((c) => testsuite.testcases.includes(c.content.id));
      let suiteMeta = this.suiteNameMap.get(testsuite)!;

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
          let caseMeta = this.caseNameMap.get(tc.content)!;
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

    return { suites };
  }

  private verifyDuplication() {
    this.findDuplication(this.pageNameMap.values());
    this.findDuplication(this.caseNameMap.values());
    this.findDuplication(this.suiteNameMap.values());
    this.findDuplication(this.routineNameMap.values());
  }

  private findDuplication(nameInfo: IterableIterator<IOutputFileFileInfo>) {
    const allFilePath = Array.from(nameInfo).map((x) => x.outputFilePath);
    const firstDuplication = allFilePath.find((x) => allFilePath.indexOf(x) !== allFilePath.lastIndexOf(x));
    if (firstDuplication) {
      throw new Error(`Duplicate output file: ${firstDuplication}`);
    }
  }

  /** Get an instance of OutputFileFileInfo with the provided guid of an item in the rmProj  */
  public get(guid: string): IOutputFileFileInfo {
    // IPage
    for (let [page, info] of this.pageNameMap) {
      if (page.id === guid) {
        return info;
      }
    }
    // ITestRoutine
    for (let [suite, info] of this.suiteNameMap) {
      if (suite.id === guid) {
        return info;
      }
    }
    // TCase
    for (let [tcase, info] of this.caseNameMap) {
      if (tcase.id === guid) {
        return info;
      }
    }
    // ITestRoutine
    for (let [routine, info] of this.routineNameMap) {
      if (routine.id === guid) {
        return info;
      }
    }
    throw new Error(`NameMap doesn't contain a complete set of names.`);
  }
}
