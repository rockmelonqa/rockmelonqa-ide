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
import { addIndent, hasPlaceholder, upperCaseFirstChar } from "../utils/stringUtils";
import { MsTestProjMeta } from "./msTestProjMeta";
import { PlaywrightCsharpMsTestTemplatesProvider } from "./playwrightCsharpMsTestTemplatesProvider";
import { IDataSetInfo } from "../playwright-charp-common/dataSetInfo";
import generateDatasetInfos from "../playwright-charp-common/generateDatasetInfos";
import { PlaywrightCsharpCodeGen } from "../playwright-charp-common/playwrightCsharpCodeGen";
import { IOutputProjectMetadataProcessor } from "../playwright-charp-common/outputProjectMetadataProcessor";
import { IPlaywrightCsharpTemplatesProvider } from "../playwright-charp-common/playwrightCsharpTemplatesProvider";
import { createOutputProjectMetadata } from "../codegenOutputProjectMeta";

export class PlaywrightCsharpMSTestCodeGen extends PlaywrightCsharpCodeGen implements ICodeGen {
  /**
   * Constructor
   */
  constructor(projMeta: ISourceProjectMetadata) {
    super(projMeta);
  }

  protected override getOutProjMeta(): IOutputProjectMetadataProcessor {
    return new MsTestProjMeta(this._projMeta);
  }

  protected override getTemplateProvider(): IPlaywrightCsharpTemplatesProvider {
    return new PlaywrightCsharpMsTestTemplatesProvider(
      path.join(this._rmprojFile.folderPath, StandardFolder.CustomCode, "templates")
    );
  }

  /** Generate MsTest project */
  public async generateCode(full: boolean, writeFile: WriteFileFn): Promise<string> {
    await this.generateEnvironmentSettingsFile(writeFile);
    await this.generateEnvironmentSetterScripts(writeFile);
    await this.generatePageFiles(writeFile);
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

  private async generateProjectFiles(writeFile: WriteFileFn) {
    // # Generate full project files
    // Files:
    //     - {Namespace}.csproj
    //     - Usings.cs
    //     - .runsettings
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

  private async generateSupportFiles(writeFile: WriteFileFn) {
    // Filename: PageDefinitions.cs
    await writeFile(
      `${StandardOutputFile.PageDefinitions}${this._outputFileExt}`,
      this.generatePageDefinitions(this._projMeta.pages.map((p) => p.content))
    );

    // # Generate TestLocatorHelper

    // Filename: LocatorHelper.cs
    await writeFile(
      `${StandardOutputFolder.Support}/${StandardOutputFile.LocatorHelper}${this._outputFileExt}`,
      this._templateProvider.getLocatorHelper(this._rmprojFile.content.rootNamespace)
    );

    await writeFile(
      `${StandardOutputFolder.Support}/${StandardOutputFile.TestCaseBase}${this._outputFileExt}`,
      this._templateProvider.getTestCaseBase(this._rmprojFile.content.rootNamespace)
    );

    await writeFile(
      `${StandardOutputFolder.Support}/${StandardOutputFile.TestSuiteBase}${this._outputFileExt}`,
      this._templateProvider.getTestSuiteBase(
        this._rmprojFile.content.rootNamespace,
        this._rmprojFile.content.testIdAttributeName
      )
    );
  }

  private async generateSuiteFiles(writeFile: WriteFileFn) {
    for (let { content: testsuite } of this._projMeta.testSuites) {
      let outputFileRelPath = this._outProjMeta.get(testsuite.id)!.outputFileRelPath;
      let testClassContent = this.generateTestSuiteFile(
        testsuite,
        this._projMeta.testCases.map((tc) => tc.content)
      );
      await writeFile(outputFileRelPath, testClassContent);
    }
  }

  private async generatePageFiles(writeFile: WriteFileFn) {
    for (let page of this._projMeta.pages) {
      let pageContent = this.generatePage(page.content);
      let fileRelPath = this._outProjMeta.get(page.content.id)!.outputFileRelPath;
      await writeFile(fileRelPath, pageContent);
    }
  }

  private async generateCaseFiles(writeFile: WriteFileFn) {
    for (let { content: testCase } of this._projMeta.testCases) {
      let testClassContent = this.generateTestCaseFile(
        testCase,
        this._projMeta.pages.map((p) => p.content),
        this._projMeta.testRoutines.map((p) => p.content)
      );
      let outputFileRelPath = this._outProjMeta.get(testCase.id)!.outputFileRelPath;

      await writeFile(outputFileRelPath, testClassContent);
    }
  }

  private async generateRoutineFiles(writeFile: WriteFileFn) {
    for (let { content: testRoutine } of this._projMeta.testRoutines) {
      const datasets: IDataSetInfo[] = generateDatasetInfos(testRoutine);
      const testRoutinesClasses: string[] = [];

      // For each dataset, we generate a separate routine class
      for (let dataset of datasets) {
        let testRoutineClass = this.generateTestRoutineClass(
          testRoutine,
          this._projMeta.pages.map((p) => p.content),
          dataset
        );
        testRoutinesClasses.push(testRoutineClass);
      }

      let testRoutineFile = this.generateTestRoutineFile(testRoutine, testRoutinesClasses);
      let outputFileRelPath = this._outProjMeta.get(testRoutine.id)!.outputFileRelPath;
      await writeFile(outputFileRelPath, testRoutineFile);
    }
  }

  private generatePageDefinitions(pages: IPage[]): string {
    let usingDirectives: string[] = [];
    for (let page of pages) {
      let pageNamespace = this._outProjMeta.get(page.id)!.outputFileFullNamespace;
      let usingDirective = `using ${pageNamespace};`;
      if (!usingDirectives.includes(usingDirective)) {
        usingDirectives.push(usingDirective);
      }
    }

    let usings = usingDirectives.join(EOL);

    let propertyDeclarationItems = [];
    for (let page of pages) {
      let pageName = this._outProjMeta.get(page.id)!.outputFileClassName;
      propertyDeclarationItems.push(`public ${pageName} ${pageName} { get; private set; }`);
    }

    let propertyDeclarations = propertyDeclarationItems.join(EOL);
    propertyDeclarations = addIndent(propertyDeclarations, this._indentString);

    //
    // Build constructor body
    // Example:
    // this.LoginPage = new LoginPage(this);
    //
    let propertyInitList = [];
    for (let page of pages) {
      let pageName = this._outProjMeta.get(page.id)!.outputFileClassName;
      propertyInitList.push(`${pageName} = new ${pageName}(page);`);
    }

    let propertyInits = propertyInitList.join(EOL);
    propertyInits = addIndent(propertyInits, this._indentString.repeat(2));

    return this._templateProvider.getPageDefinitions(this._rootNamespace, usings, propertyDeclarations, propertyInits);
  }

  private generateEnvironmentSettingsContent(page: IEnvironmentContent): string {
    return "";
  }

  private generatePage(page: IPage): string {
    let pageItems = [];
    for (let element of page.elements) {
      if (element.type === "pageElement") {
        pageItems.push(
          this._templateProvider.getLocator({
            elementName: element.name!,
            locatorStr: element.locator || "",
            locatorType: element.findBy!,
            description: element.description!,
            hasParams: hasPlaceholder(element.locator!),
            returnedLocatorType:
              element.findBy! === LocatorType.IFrame ||
              element.findBy! === LocatorType.IFrameId ||
              element.findBy! === LocatorType.IFrameName
                ? "IFrameLocator"
                : "ILocator",
          })
        );
        continue;
      }

      if (element.type === "comment") {
        pageItems.push(this._templateProvider.getComment(element.comment!));
      }
    }

    let pageBody = pageItems.join(EOL + EOL);

    // Indent the output with 1 indent
    pageBody = addIndent(pageBody, this._indentString);

    let fullNamespace = this._outProjMeta.get(page.id)!.outputFileFullNamespace;
    let pageClassName = this._outProjMeta.get(page.id)!.outputFileClassName;

    return this._templateProvider.getPage(fullNamespace, pageClassName, page.description || "", pageBody);
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

  private generateTestRoutineFile(testRoutine: ITestRoutine, testRoutineClasses: string[]) {
    let routineFileContent = this._templateProvider.getTestRoutineFile(
      this._rootNamespace,
      this._outProjMeta.get(testRoutine.id)!.outputFileFullNamespace,
      testRoutineClasses
    );
    return routineFileContent;
  }

  private generateTestRoutineClass(testRoutine: ITestRoutine, pages: IPage[], datasetInfo: IDataSetInfo) {
    const testRoutineBody = this.generateTestRoutineBody(testRoutine, pages, datasetInfo);

    // Output class name will be "{testRoutineClassName}{datasetName}";
    const testRoutineName = this._outProjMeta.get(testRoutine.id)!.outputFileClassName;
    const finalOutputClassName = `${testRoutineName}${datasetInfo.name}`;

    let routineFileContent = this._templateProvider.getTestRoutineClass(
      finalOutputClassName,
      testRoutine.description,
      testRoutineBody
    );

    return routineFileContent;
  }

  private generateTestCaseFile(testCase: ITestCase, pages: IPage[], routines: ITestRoutine[]) {
    const testcaseBody = this.generateTestCaseBody(testCase, pages, routines);

    let testFile = this._templateProvider.getTestCaseFile(
      this._outProjMeta.get(testCase.id)!.outputFileClassName,
      testCase.description,
      testcaseBody,
      this._rootNamespace,
      this._outProjMeta.get(testCase.id)!.outputFileFullNamespace
    );
    return testFile;
  }

  private generateTestCaseFunction(testCase: ITestCase) {
    const testcaseName = this._outProjMeta.get(testCase.id)!.outputFileClassName;
    const testCaseMethod = this._templateProvider.getTestFunction(
      upperCaseFirstChar(testcaseName),
      testCase.description
    );
    return testCaseMethod;
  }
}
