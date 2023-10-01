import { EOL } from "os";
import path from "path";
import {
  ISourceProjectMetadata,
  ITestCase,
  ITestRoutine,
  ITestSuite,
  LocatorType,
  StandardFolder,
  StandardOutputFolder,
} from "../../file-defs";
import { IPage } from "../../file-defs/pageFile";
import { StandardOutputFile } from "../../file-defs/standardOutputFile";
import { ICodeGen } from "../types";
import { hasPlaceholder, upperCaseFirstChar } from "../utils/stringUtils";
import { PlaywrightCsharpXUnitTemplatesProvider } from "./playwrightCsharpXUnitTemplatesProvider";
import { XUnitProjectMetaGenerator } from "./xunitProjectMetaGenerator";
import { IDataSetInfo } from "../playwright-charp-common/dataSetInfo";
import { CommonPlaywrightCsharpCodeGen } from "../playwright-charp-common/commonPlaywrightCsharpCodeGen";
import { IPlaywrightCsharpTemplatesProvider } from "../playwright-charp-common/playwrightCsharpTemplatesProvider";
import { IOutputProjectMetadataGenerator } from "../playwright-charp-common/outputProjectMetadataProcessor";
import generateDatasetInfos from "../playwright-charp-common/generateDatasetInfos";
import { createOutputProjectMetadata } from "../codegenOutputProjectMeta";
import { addIndent } from "../utils/codegenUtils";

type WriteFileFn = (path: string, content: string) => Promise<void>;

export class PlaywrightCsharpXUnitCodeGen extends CommonPlaywrightCsharpCodeGen implements ICodeGen {
  private _templateProvider: PlaywrightCsharpXUnitTemplatesProvider;

  constructor(projMeta: ISourceProjectMetadata) {
    super(projMeta);
    this._templateProvider = new PlaywrightCsharpXUnitTemplatesProvider(
      path.join(this._rmprojFile.folderPath, StandardFolder.CustomCode, "templates"),
      this._rmprojFile.content.indent,
      this._rmprojFile.content.indentSize
    );
  }

  protected override getOutProjMeta(): IOutputProjectMetadataGenerator {
    return new XUnitProjectMetaGenerator(this._projMeta);
  }

  async generateCode(full: boolean, writeFile: WriteFileFn): Promise<string> {
    await this.generateEnvironmentSettingsFile(writeFile);
    await this.generateEnvironmentSetterScripts(writeFile);

    await this.generatePageDefinitionsFile(writeFile);
    await this.generatePageFiles(writeFile);
    await this.generateTestCaseFiles(writeFile);
    await this.generateRoutineFiles(writeFile);
    await this.generateTestSuiteFiles(writeFile);
    await this.generateSupportFiles(writeFile);
    await this.generateXUnitSupportFiles(writeFile);

    if (full) {
      await this.writeProjectFiles(writeFile);
    }
    await this.writeMetaFile(writeFile);

    return "";
  }

  private async writeMetaFile(writeFile: WriteFileFn) {
    const outputProjectMetadata = await createOutputProjectMetadata(this._rmprojFile);
    await writeFile(StandardOutputFile.MetaData, JSON.stringify(outputProjectMetadata, null, 2));
  }

  private async writeProjectFiles(writeFile: WriteFileFn) {
    await writeFile(
      `${this._rmprojFile.content.rootNamespace}.csproj`,
      this._templateProvider.getCsProject(this._rmprojFile.content.rootNamespace)
    );
    await writeFile(
      `${StandardOutputFile.Usings}${this._outputFileExt}`,
      this._templateProvider.getUsings(this._rmprojFile.content.rootNamespace, this._projMeta.testRoutines.length > 0)
    );
    await writeFile(`${StandardOutputFile.RunSettings}`, this._templateProvider.getRunSettings());
  }

  private async generateXUnitSupportFiles(writeFile: WriteFileFn) {
    await writeFile(
      `${StandardOutputFolder.XUnitSupport}/${StandardOutputFile.TestSuiteBase}${this._outputFileExt}`,
      this._templateProvider.getTestSuiteBase(
        this._rmprojFile.content.rootNamespace,
        this._rmprojFile.content.testIdAttributeName
      )
    );
  }

  private async generateTestSuiteFiles(writeFile: WriteFileFn) {
    // Filename: Tests/{TestClassName}.cs
    for (let testSuite of this._projMeta.testSuites) {
      let fileRelPath = this._outProjMeta.get(testSuite.content.id)!.outputFileRelPath;
      let classContent = this.generateTestSuiteFile(
        testSuite.content,
        this._projMeta.testCases.map((tcFile) => tcFile.content)
      );
      await writeFile(fileRelPath, classContent);
    }
  }

  private generateTestSuiteFile(testSuite: ITestSuite, testcases: ITestCase[]) {
    var testcaseMethods = [];
    let usingDirectives: string[] = [];

    for (let testcaseId of testSuite.testcases) {
      let testcase = testcases.find((tc) => tc.id === testcaseId);
      if (!testcase) {
        throw new Error("DEV ERROR: cannot find testcase with id: " + testcaseId);
      }

      let fullNamespace = this._outProjMeta.get(testcase.id)!.outputFileFullNamespace;

      let usingDirective = `using ${fullNamespace};`;
      if (!usingDirectives.includes(usingDirective)) {
        usingDirectives.push(usingDirective);
      }

      let testcaseFunction = this.generateTestCaseFunction(testcase);
      testcaseMethods.push(testcaseFunction);
    }
    let usings = usingDirectives.join(EOL);
    let classBody = testcaseMethods.join(EOL + EOL);

    // Indent test method body with 1 indent;
    classBody = addIndent(classBody, this._indentString);

    let testClass = this._templateProvider.getTestSuiteFile(
      usings,
      this._outProjMeta.get(testSuite.id)!.outputFileClassName,
      testSuite.description,
      classBody,
      this._rootNamespace,
      this._outProjMeta.get(testSuite.id)!.outputFileFullNamespace
    );
    return testClass;
  }
}
