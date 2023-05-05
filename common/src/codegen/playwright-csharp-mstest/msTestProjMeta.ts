import { ISourceProjectMeta, ITestCase, ITestRoutine, ITestSuite } from "../../file-defs";
import { IPage } from "../../file-defs/pageFile";
import { generateDotnetOutputProjectMeta } from "../playwright-charp/generateDotnetOutputProjectMeta";
import {
  IOutputProjMetaGenerator,
  createMapForPages,
  createMapForTestCases,
  createMapForTestRoutines,
  createMapForTestSuites,
} from "../playwright-charp/outProjMeta";
import { IOutputProjectMetadata } from "../playwright-charp/outputProjectMetadata";
import { IOutputFileFileInfo } from "../types";

/** MsTest project meta: Contains info of all files and other resources */
export class MsTestProjMeta implements IOutputProjMetaGenerator {
  private _projMeta: ISourceProjectMeta;

  public readonly pageMetaMap: Map<IPage, IOutputFileFileInfo> = new Map<IPage, IOutputFileFileInfo>();
  public readonly suiteMetaMap: Map<ITestSuite, IOutputFileFileInfo> = new Map<ITestSuite, IOutputFileFileInfo>();
  public readonly caseMetaMap: Map<ITestCase, IOutputFileFileInfo> = new Map<ITestCase, IOutputFileFileInfo>();
  public readonly routineMetaMap: Map<ITestRoutine, IOutputFileFileInfo> = new Map<ITestRoutine, IOutputFileFileInfo>();

  constructor(codegenMeta: ISourceProjectMeta) {
    this._projMeta = codegenMeta;

    const rmprojFile = codegenMeta.project;

    this.pageMetaMap = createMapForPages(rmprojFile, codegenMeta.pages);
    this.suiteMetaMap = createMapForTestSuites(rmprojFile, codegenMeta.testSuites);
    this.caseMetaMap = createMapForTestCases(rmprojFile, codegenMeta.testCases);
    this.routineMetaMap = createMapForTestRoutines(rmprojFile, codegenMeta.testRoutines);

    this.verifyDuplication();
  }

  public generateOutputProjectMeta(): IOutputProjectMetadata {
    return generateDotnetOutputProjectMeta(this._projMeta);
  }

  private verifyDuplication() {
    this.findDuplication(this.pageMetaMap.values());
    this.findDuplication(this.caseMetaMap.values());
    this.findDuplication(this.suiteMetaMap.values());
    this.findDuplication(this.routineMetaMap.values());
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
    throw new Error(`NameMap doesn't contain a complete set of names.`);
  }
}
