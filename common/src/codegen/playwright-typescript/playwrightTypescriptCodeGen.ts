import path from "path";
import {
  ISourceProjectMetadata,
  ITestCase,
  ITestRoutine,
  ITestSuite,
  StandardFolder,
  StandardOutputFolder,
  StandardOutputFolderTypeScript,
} from "../../file-defs";
import { IPage } from "../../file-defs/pageFile";
import { StandardOutputFile } from "../../file-defs/standardOutputFile";
import { ICodeGen, WriteFileFn } from "../types";
import { PlaywrightTypescriptTemplateProvider } from "./templateProvider";
import { IDataSetInfo } from "../playwright-charp-common/dataSetInfo";
import { CodeGenBase } from "../codegen-common/codeGenBase";

export class PlaywrightTypeScriptCodeGen extends CodeGenBase implements ICodeGen {
  _templateProvider: PlaywrightTypescriptTemplateProvider;

  constructor(projMeta: ISourceProjectMetadata) {
    super(projMeta);
    this._templateProvider = new PlaywrightTypescriptTemplateProvider(
      path.join(this._rmprojFile.folderPath, StandardFolder.CustomCode, "templates")
    );
  }

  /** Generate Playwright Typescript project */
  public async generateCode(full: boolean, writeFile: WriteFileFn): Promise<string> {
    await this.generateEnvironmentSettingsFile(writeFile);
    await this.generateEnvironmentSetterScripts(writeFile);
    await this.generatePageFiles(writeFile);
    await this.generatePageDefinitionsFiles(writeFile);
    await this.generateCaseFiles(writeFile);
    await this.generateRoutineFiles(writeFile);
    await this.generateSuiteFiles(writeFile);
    await this.generateSupportFiles(writeFile);

    if (full) {
      await this.generateProjectFiles(writeFile);
    }

    await this.generateMetaFiles(writeFile);
    return "";
  }

  private async generateEnvironmentSettingsFile(writeFile: WriteFileFn) {}

  private async generateProjectFiles(writeFile: WriteFileFn) {}

  private async generateMetaFiles(writeFile: WriteFileFn) {}
  private async generatePageDefinitionsFiles(writeFile: WriteFileFn) {
    await writeFile(
      `${StandardOutputFile.PageDefinitions}${this._outputFileExt}`,
      this.generatePageDefinitions(this._projMeta.pages.map((p) => p.content))
    );
  }

  private async generateSupportFiles(writeFile: WriteFileFn) {
    await writeFile(
      `${StandardOutputFolderTypeScript.Support}/${StandardOutputFile.TestCaseBase}${this._outputFileExt}`,
      this._templateProvider.getTestCaseBase()
    );
    await writeFile(
      `${StandardOutputFolderTypeScript.Support}/${StandardOutputFile.PageBase}${this._outputFileExt}`,
      this._templateProvider.getPageBase()
    );
    await writeFile(
      `${StandardOutputFolderTypeScript.Support}/${StandardOutputFile.PageTest}${this._outputFileExt}`,
      this._templateProvider.getPageTest()
    );
  }

  private async generateSuiteFiles(writeFile: WriteFileFn) {}

  private async generatePageFiles(writeFile: WriteFileFn) {}

  private async generateCaseFiles(writeFile: WriteFileFn) {}

  private async generateRoutineFiles(writeFile: WriteFileFn) {}

  private generatePageDefinitions(pages: IPage[]): string {
    return "";
  }

  private generateTestSuiteFile(testSuite: ITestSuite, testcases: ITestCase[]) {}

  private generateTestRoutineFile(testRoutine: ITestRoutine, testRoutineClasses: string[]) {}

  private generateTestRoutineClass(testRoutine: ITestRoutine, pages: IPage[], datasetInfo: IDataSetInfo) {}

  private generateTestCaseFile(testCase: ITestCase, pages: IPage[], routines: ITestRoutine[]) {}

  private generateTestCaseFunction(testCase: ITestCase) {}
}
