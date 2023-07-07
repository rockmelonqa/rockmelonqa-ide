import fs from "fs";
import { IEnvironmentContent, ISourceProjectMetadata, ITestCase, ITestRoutine, ITestSuite } from "../../file-defs";
import { IPage } from "../../file-defs/pageFile";
import { IOutputProjectMetadataGenerator, MapCreator } from "../playwright-charp-common/outputProjectMetadataProcessor";
import {
  IEnvironmentFileInfo,
  IOutputFileInfo,
  IOutputProjectMetadata,
  IPageInfo,
  ISuiteInfo,
  ITestCaseInfo,
} from "../types";
import path from "path";
import { EOL } from "os";

/** PlaywrightTypeScriptProjMeta project meta: Contains info of all files and other resources */
export class PlaywrightTypeScriptProjMetaGenerator implements IOutputProjectMetadataGenerator {
  private projMeta: ISourceProjectMetadata;

  public readonly pageMetaMap: Map<IPage, IOutputFileInfo> = new Map<IPage, IOutputFileInfo>();
  public readonly suiteMetaMap: Map<ITestSuite, IOutputFileInfo> = new Map<ITestSuite, IOutputFileInfo>();
  public readonly caseMetaMap: Map<ITestCase, IOutputFileInfo> = new Map<ITestCase, IOutputFileInfo>();
  public readonly routineMetaMap: Map<ITestRoutine, IOutputFileInfo> = new Map<ITestRoutine, IOutputFileInfo>();
  public readonly environmentFileMetaMap: Map<IEnvironmentContent, IOutputFileInfo> = new Map<
    IEnvironmentContent,
    IOutputFileInfo
  >();

  constructor(projMeta: ISourceProjectMetadata) {
    this.projMeta = projMeta;

    const rmprojFile = projMeta.project;

    const mapCreator: MapCreator = new MapCreator(rmprojFile);
    this.pageMetaMap = mapCreator.createMapForPages(rmprojFile, projMeta.pages);
    this.suiteMetaMap = mapCreator.createMapForTestSuites(rmprojFile, projMeta.testSuites);
    this.caseMetaMap = mapCreator.createMapForTestCases(rmprojFile, projMeta.testCases);
    this.routineMetaMap = mapCreator.createMapForTestRoutines(rmprojFile, projMeta.testRoutines);
    this.environmentFileMetaMap = mapCreator.createMapForEnvironmentFiles(rmprojFile, projMeta.environmentFiles);

    this.verifyDuplication();
  }

  public createOutputProjectMetadata(): IOutputProjectMetadata {
    const environments: IEnvironmentFileInfo[] = this.generateEnvMeta();
    const suites: ISuiteInfo[] = this.generateSuitesMeta();
    const cases: ITestCaseInfo[] = this.generateCasesMeta();
    const pages: IPageInfo[] = this.generatePagesMeta();
    return { suites, cases, pages, environments };
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

  generateEnvMeta() {
    const environments: IEnvironmentFileInfo[] = [];

    for (let { content: environmentContent } of this.projMeta.environmentFiles) {
      let envMeta = this.environmentFileMetaMap.get(environmentContent)!;

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
    return environments;
  }

  generateSuitesMeta() {
    const suites: ISuiteInfo[] = [];

    for (let { content: testsuite } of this.projMeta.testSuites) {
      let testCases = this.projMeta.testCases.filter((c) => testsuite.testcases.includes(c.content.id));
      let suiteMeta = this.suiteMetaMap.get(testsuite)!;
      let suiteRaw = fs.readFileSync(suiteMeta.outputFilePath, "utf-8");
      let fileLines = suiteRaw.split(/\r?\n/);

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
          let caseMeta = this.caseMetaMap.get(tc.content)!;
          let caseFuntionStartWith = `test("${caseMeta.outputFileClassName}",`;

          let lineNumber = 0;
          for (const [index, value] of fileLines.entries()) {
            if (value.startsWith(caseFuntionStartWith)) {
              lineNumber = index + 1;
              break;
            }
          }

          let caseInfo: ITestCaseInfo = {
            name: caseMeta.outputFileClassName,
            fullyQualifiedName: `${suiteMeta.outputFileFullNamespace}.${caseMeta.outputFileClassName}`,
            inputFileName: caseMeta.inputFileName,
            inputFilePath: caseMeta.inputFilePath,
            inputFileRelPath: caseMeta.inputFileRelPath,
            outputFileName: caseMeta.outputFileName,
            outputFilePath: caseMeta.outputFilePath,
            outputFileRelPath: caseMeta.outputFileRelPath,
            isValid: caseMeta.isValid,
            constainerSuiteFileRelPath: suiteInfo.outputFileRelPath,
            lineNumber,
          };
          return caseInfo;
        }),
      };
      suites.push(suiteInfo);
    }
    return suites;
  }

  generateCasesMeta() {
    const cases: ITestCaseInfo[] = [];

    for (let { content: testcase, isValid } of this.projMeta.testCases) {
      let caseMeta = this.caseMetaMap.get(testcase)!;

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
    return cases;
  }

  generatePagesMeta() {
    const pages: IPageInfo[] = [];
    for (let { content: page, isValid } of this.projMeta.pages) {
      let pageMeta = this.pageMetaMap.get(page)!;

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

    return pages;
  }

  /** Get an instance of IOutputFileInfo with the provided guid of an item in the rmProj  */
  public get(guid: string): IOutputFileInfo {
    // IPage
    for (let page of this.pageMetaMap.keys()) {
      if (page.id === guid) {
        return this.pageMetaMap.get(page)!;
      }
    }
    // ITestRoutine
    for (let suite of this.suiteMetaMap.keys()) {
      if (suite.id === guid) {
        return this.suiteMetaMap.get(suite)!;
      }
    }
    // TCase
    for (let tcase of this.caseMetaMap.keys()) {
      if (tcase.id === guid) {
        return this.caseMetaMap.get(tcase)!;
      }
    }
    // ITestRoutine
    for (let routine of this.routineMetaMap.keys()) {
      if (routine.id === guid) {
        return this.routineMetaMap.get(routine)!;
      }
    }
    throw new Error(`Lookup failed for key ${guid}. NameMap doesn't contain a complete set of names. `);
  }
}
