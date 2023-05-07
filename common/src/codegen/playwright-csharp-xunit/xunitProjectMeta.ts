import { ISourceProjectMetadata, ITestCase, ITestRoutine, ITestSuite } from "../../file-defs";
import { IPage } from "../../file-defs/pageFile";
import { createDotnetProjectMetadata } from "../playwright-charp/createDotnetProjectMetadata";
import {
  IOutputProjectMetadataProcessor,
  createMapForPages,
  createMapForTestCases,
  createMapForTestRoutines,
  createMapForTestSuites,
} from "../playwright-charp/outputProjectMetadataProcessor";
import { IOutputFileInfo, IOutputProjectMetadata } from "../types";

export class XUnitProjectMeta implements IOutputProjectMetadataProcessor {
  private _projMeta: ISourceProjectMetadata;

  public readonly pageNameMap: Map<IPage, IOutputFileInfo> = new Map<IPage, IOutputFileInfo>();
  public readonly suiteNameMap: Map<ITestSuite, IOutputFileInfo> = new Map<ITestSuite, IOutputFileInfo>();
  public readonly caseNameMap: Map<ITestCase, IOutputFileInfo> = new Map<ITestCase, IOutputFileInfo>();
  public readonly routineNameMap: Map<ITestRoutine, IOutputFileInfo> = new Map<ITestRoutine, IOutputFileInfo>();

  /**
   *
   */
  constructor(codegenMeta: ISourceProjectMetadata) {
    this._projMeta = codegenMeta;
    const rmprojFile = codegenMeta.project;

    this.pageNameMap = createMapForPages(rmprojFile, codegenMeta.pages);
    this.suiteNameMap = createMapForTestSuites(rmprojFile, codegenMeta.testSuites);
    this.caseNameMap = createMapForTestCases(rmprojFile, codegenMeta.testCases);
    this.routineNameMap = createMapForTestRoutines(rmprojFile, codegenMeta.testRoutines);

    this.verifyDuplication();
  }

  public createOutputProjectMetadata(): IOutputProjectMetadata {
    return createDotnetProjectMetadata(this._projMeta);
  }

  private verifyDuplication() {
    this.findDuplication(this.pageNameMap.values());
    this.findDuplication(this.caseNameMap.values());
    this.findDuplication(this.suiteNameMap.values());
    this.findDuplication(this.routineNameMap.values());
  }

  private findDuplication(nameInfo: IterableIterator<IOutputFileInfo>) {
    const allFilePath = Array.from(nameInfo).map((x) => x.outputFilePath);
    const firstDuplication = allFilePath.find((x) => allFilePath.indexOf(x) !== allFilePath.lastIndexOf(x));
    if (firstDuplication) {
      throw new Error(`Duplicate output file: ${firstDuplication}`);
    }
  }

  /** Get an instance of IOutputFileInfo with the provided guid of an item in the rmProj  */
  public get(guid: string): IOutputFileInfo {
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
