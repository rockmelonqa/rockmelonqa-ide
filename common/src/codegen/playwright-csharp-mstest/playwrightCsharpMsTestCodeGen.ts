import { EOL } from "os";
import path from "path";
import {
  IEnvironmentContent,
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
import { ICodeGen, WriteFileFn } from "../types";
import { hasPlaceholder, upperCaseFirstChar } from "../utils/stringUtils";
import { MsTestProjMetaGenerator } from "./msTestProjMetaGenerator";
import { PlaywrightCsharpMsTestTemplatesProvider } from "./playwrightCsharpMsTestTemplatesProvider";
import { DataSetCollection, IDataSetInfo } from "../playwright-charp-common/dataSetInfo";
import generateDatasetInfos from "../playwright-charp-common/generateDatasetInfos";
import { CommonPlaywrightCsharpCodeGen } from "../playwright-charp-common/commonPlaywrightCsharpCodeGen";
import { IOutputProjectMetadataGenerator } from "../playwright-charp-common/outputProjectMetadataProcessor";
import { IPlaywrightCsharpTemplatesProvider } from "../playwright-charp-common/playwrightCsharpTemplatesProvider";
import { createOutputProjectMetadata } from "../codegenOutputProjectMeta";
import { addIndent } from "../utils/codegenUtils";

export class PlaywrightCsharpMSTestCodeGen extends CommonPlaywrightCsharpCodeGen implements ICodeGen {
  private _templateProvider: PlaywrightCsharpMsTestTemplatesProvider;
  /**
   * Constructor
   */
  constructor(projMeta: ISourceProjectMetadata) {
    super(projMeta);

    this._templateProvider = new PlaywrightCsharpMsTestTemplatesProvider(
      path.join(this._rmprojFile.folderPath, StandardFolder.CustomCode, "templates"),
      this._rmprojFile.content.indent,
      this._rmprojFile.content.indentSize
    );
  }

  protected override getOutProjMeta(): IOutputProjectMetadataGenerator {
    return new MsTestProjMetaGenerator(this._projMeta);
  }

  /** Generate MsTest project */
  public async generateCode(full: boolean, writeFile: WriteFileFn): Promise<string> {
    await this.generateEnvironmentSettingsFile(writeFile);
    await this.generateEnvironmentSetterScripts(writeFile);
    await this.generatePageFiles(writeFile);
    await this.generateTestCaseFiles(writeFile);
    await this.generateRoutineFiles(writeFile);
    await this.generateTestSuiteFiles(writeFile);
    await this.generateSupportFiles(writeFile);
    await this.generateMsTestSupportFiles(writeFile);
    await this.generatePageDefinitionsFile(writeFile);

    if (full) {
      await this.generateProjectFiles(writeFile);
    }

    await this.generateMetaFiles(writeFile);
    return "";
  }

  private async generateProjectFiles(writeFile: WriteFileFn) {
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

  private async generateMetaFiles(writeFile: WriteFileFn) {
    // Write output project metadata
    const outputProjectMetadata = await createOutputProjectMetadata(this._rmprojFile);
    await writeFile(StandardOutputFile.MetaData, JSON.stringify(outputProjectMetadata, null, 2));
  }

  private async generateMsTestSupportFiles(writeFile: WriteFileFn) {
    await writeFile(
      `${StandardOutputFolder.MsTestSupport}/${StandardOutputFile.TestSuiteBase}${this._outputFileExt}`,
      this._templateProvider.getTestSuiteBase(
        this._rmprojFile.content.rootNamespace,
        this._rmprojFile.content.testIdAttributeName
      )
    );
  }

  private async generateTestSuiteFiles(writeFile: WriteFileFn) {
    for (let { content: testsuite } of this._projMeta.testSuites) {
      let outputFileRelPath = this._outProjMeta.get(testsuite.id)!.outputFileRelPath;
      let testClassContent = this.generateTestSuiteFile(
        testsuite,
        this._projMeta.testCases.map((tc) => tc.content)
      );
      await writeFile(outputFileRelPath, testClassContent);
    }
  }

  private generateTestSuiteFile(testSuite: ITestSuite, testcases: ITestCase[]) {
    const testcaseMethods: string[] = [];
    const usingDirectives: string[] = [];

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

  protected generateTestCaseFunction(testCase: ITestCase) {
    const testcaseName = this._outProjMeta.get(testCase.id)!.outputFileClassName;
    const testCaseMethod = this._templateProvider.getTestFunction(
      upperCaseFirstChar(testcaseName),
      testCase.description
    );
    return testCaseMethod;
  }
}
