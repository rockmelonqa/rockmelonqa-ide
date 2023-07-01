import { ISourceProjectMetadata, ITestCase, ITestRoutine, ITestSuite } from "../../file-defs";
import { IPage } from "../../file-defs/pageFile";
import { createDotnetProjectMetadata } from "../playwright-charp-common/createDotnetProjectMetadata";
import {
  IOutputProjectMetadataProcessor,
  createMapForPages,
  createMapForTestCases,
  createMapForTestRoutines,
  createMapForTestSuites,
} from "../playwright-charp-common/outputProjectMetadataProcessor";
import { IOutputFileInfo, IOutputProjectMetadata } from "../types";

/** PlaywrightTypeScriptProjMeta project meta: Contains info of all files and other resources */
export class PlaywrightTypeScriptProjMeta implements IOutputProjectMetadataProcessor {
  private _projMeta: ISourceProjectMetadata;

  public readonly pageMetaMap: Map<IPage, IOutputFileInfo> = new Map<IPage, IOutputFileInfo>();
  public readonly suiteMetaMap: Map<ITestSuite, IOutputFileInfo> = new Map<ITestSuite, IOutputFileInfo>();
  public readonly caseMetaMap: Map<ITestCase, IOutputFileInfo> = new Map<ITestCase, IOutputFileInfo>();
  public readonly routineMetaMap: Map<ITestRoutine, IOutputFileInfo> = new Map<ITestRoutine, IOutputFileInfo>();

  constructor(codegenMeta: ISourceProjectMetadata) {
    this._projMeta = codegenMeta;

    const rmprojFile = codegenMeta.project;

    this.pageMetaMap = createMapForPages(rmprojFile, codegenMeta.pages);
    this.suiteMetaMap = createMapForTestSuites(rmprojFile, codegenMeta.testSuites);
    this.caseMetaMap = createMapForTestCases(rmprojFile, codegenMeta.testCases);
    this.routineMetaMap = createMapForTestRoutines(rmprojFile, codegenMeta.testRoutines);

    this.verifyDuplication();
  }

  public createOutputProjectMetadata(): IOutputProjectMetadata {
    return createDotnetProjectMetadata(this._projMeta);
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
