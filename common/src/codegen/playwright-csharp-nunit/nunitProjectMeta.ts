import { ISourceProjectMetadata, ITestCase, ITestRoutine, ITestSuite } from "../../file-defs";
import { IPage } from "../../file-defs/pageFile";
import { createDotnetProjectMetadata } from "../playwright-charp-common/createDotnetProjectMetadata";
import { IOutputProjectMetadataProcessor, MapCreator } from "../playwright-charp-common/outputProjectMetadataProcessor";
import { IOutputFileInfo, IOutputProjectMetadata } from "../types";

export class NunitProjectMeta implements IOutputProjectMetadataProcessor {
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

    const mapCreator: MapCreator = new MapCreator(rmprojFile);

    this.pageNameMap = mapCreator.createMapForPages(rmprojFile, codegenMeta.pages);
    this.suiteNameMap = mapCreator.createMapForTestSuites(rmprojFile, codegenMeta.testSuites);
    this.caseNameMap = mapCreator.createMapForTestCases(rmprojFile, codegenMeta.testCases);
    this.routineNameMap = mapCreator.createMapForTestRoutines(rmprojFile, codegenMeta.testRoutines);
  }

  public createOutputProjectMetadata(): IOutputProjectMetadata {
    return createDotnetProjectMetadata(this._projMeta);
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
