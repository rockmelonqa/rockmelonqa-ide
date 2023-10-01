import { EOL } from "os";
import {
  ActionType,
  ISourceProjectMetadata,
  ITestCase,
  ITestRoutine,
  LocatorType,
  StandardFolder,
  StandardOutputFile,
  StandardOutputFolder,
} from "../../file-defs";
import { IPage } from "../../file-defs/pageFile";
import { hasPlaceholder, upperCaseFirstChar } from "../utils/stringUtils";
import { IOutputProjectMetadataGenerator } from "./outputProjectMetadataProcessor";
import { createCleanName } from "../utils/createName";
import { DataSetCollection, IDataSetInfo } from "./dataSetInfo";
import { IPlaywrightCsharpTemplatesProvider } from "./playwrightCsharpTemplatesProvider";
import { ActionDataType, IActionData, WriteFileFn } from "../types";
import { ITestCaseActionStep } from "../../file-defs/testCaseFile";
import { ITestStepComment } from "../../file-defs/shared";
import { CodeGenBase } from "../codegen-common/codeGenBase";
import { addIndent } from "../utils/codegenUtils";
import generateDatasetInfos from "./generateDatasetInfos";
import { CommonPlaywrightCsharpTemplatesProvider } from "./commonPlaywrightCsharpTemplatesProvider";
import path from "path";

/** Base class for Dotnet CodeGe, including MsTest, Nunit, Xunit CodeGens */
export class CommonPlaywrightCsharpCodeGen extends CodeGenBase {
  protected _outProjMeta: IOutputProjectMetadataGenerator;
  protected _commonCsharpTemplateProvider: CommonPlaywrightCsharpTemplatesProvider;

  protected _rootNamespace: string;

  /** Regex to test for Environment variable data: e.g "{TestUser}", "{TestPassword}" */
  private static readonly EnvironmentVariableDataRegex = /{(.+)}/;

  constructor(projMeta: ISourceProjectMetadata) {
    super(projMeta);

    this._projMeta = projMeta;
    this._rootNamespace = projMeta.project.content.rootNamespace;

    this._outProjMeta = this.getOutProjMeta();
    this._commonCsharpTemplateProvider = new CommonPlaywrightCsharpTemplatesProvider(
      path.join(this._rmprojFile.folderPath, StandardFolder.CustomCode, "templates"),
      this._rmprojFile.content.indent,
      this._rmprojFile.content.indentSize
    );
  }

  protected getOutProjMeta(): IOutputProjectMetadataGenerator {
    throw new Error("Must implement getOutProjMeta in sub class");
  }

  protected getTemplateProvider(): IPlaywrightCsharpTemplatesProvider {
    throw new Error("Must implement getTemplateProvider in sub class");
  }

  protected async generateEnvironmentSettingsFile(writeFile: WriteFileFn) {
    // Aggregate all variable names in all config file
    let allNames: string[] = [];
    for (let configFile of this._projMeta.environmentFiles) {
      let namesInFile = configFile.content.settings.map((setting) => setting.name);
      allNames.push(...namesInFile);
    }
    allNames = Array.from(new Set(allNames));
    const content = this._commonCsharpTemplateProvider.getEnvironmentSettingsFiles(
      this._rmprojFile.content.rootNamespace,
      allNames
    );
    await writeFile(
      `${StandardOutputFolder.Config}/${StandardOutputFile.EnvironmentSettings}${this._outputFileExt}`,
      content
    );
  }

  protected generateTestCaseBody(testCase: ITestCase, pages: IPage[], routines: ITestRoutine[]) {
    let stepItems: string[] = [];
    for (let step of testCase.steps) {
      if (step.type === "testStep") {
        stepItems.push(...this.generateTestStep(step, pages, routines));
        continue;
      }

      if (step.type === "comment") {
        // Add an empty line before the comment
        stepItems.push("");
        stepItems.push(this.generateComment(step));
        continue;
      }
    }

    let body = stepItems.join(EOL);

    // If there is no step, we add an `await` so that there is no build warning about `async` method
    if (body.length === 0) {
      body = `await Task.CompletedTask;`;
    }

    // Indent test method body with 1 indent;
    body = addIndent(body, this._indentString, 2);
    return body;
  }

  generateRoutineUsings(testCase: ITestCase, routines: ITestRoutine[]): string[] {
    const usingStatements: string[] = [];

    for (let step of testCase.steps) {
      if (step.type !== "testStep") {
        continue;
      }
      if (step.action !== "RunTestRoutine") {
        continue;
      }
      let routineId = step.data;
      if (!routineId) {
        return [];
      }

      let routine = routines.find((r) => r.id === routineId);

      if (!routine) {
        throw new Error(`DEV ERROR: routine with id "${routineId}" not found`);
      }

      let dataSetCollection = new DataSetCollection(step.parameters);

      if (dataSetCollection.isAll()) {
        dataSetCollection.empty();
        dataSetCollection.addMany(routine.dataSets.map((ds) => ds.id));
      }

      let namespace = this._outProjMeta.get(routineId)!.outputFileFullNamespace;
      usingStatements.push(`using ${namespace};`);
    }
    return usingStatements;
  }

  /** Generates one or more code lines for the step */
  private generateTestStep(step: ITestCaseActionStep, pages: IPage[], routines: ITestRoutine[]): string[] {
    if (step.action === "RunTestRoutine") {
      return this.generateRunTestRoutineStep(step, routines);
    }

    let pageName = "";
    let elementName = "";

    if (step.page) {
      let pageId = step.page;
      let page = pages.find((p) => p.id === pageId);
      if (!page) {
        throw new Error("DEV ERROR: " + `Cannot find page with ID ${step.page}`);
      }
      pageName = this._outProjMeta.get(page.id)!.outputFileClassName;

      if (step.element) {
        let elementId = step.element;
        let element = page.elements.find((e) => e.id === elementId);
        if (!element) {
          throw new Error("DEV ERROR: " + `Cannot find element with ID ${elementId} on page ${pageName}`);
        }
        elementName = element.name || "";
      }
    }

    let actionData = this.getActionData(step.data);
    return [
      this._commonCsharpTemplateProvider.getAction({
        pageName: pageName,
        elementName: upperCaseFirstChar(elementName),
        action: step.action! as unknown as ActionType,
        data: actionData,
        parameters: step.parameters || [],
      }),
    ];
  }

  /** Generates code for RunTestRoutine step */
  private generateRunTestRoutineStep(step: ITestCaseActionStep, routines: ITestRoutine[]): string[] {
    let routineId = step.data;
    if (!routineId) {
      return [];
    }

    let routine = routines.find((r) => r.id === routineId);

    if (!routine) {
      throw new Error(`DEV ERROR: routine with id "${routineId}" not found`);
    }

    let dataSetCollection = new DataSetCollection(step.parameters);

    if (dataSetCollection.isAll()) {
      dataSetCollection.empty();
      dataSetCollection.addMany(routine.dataSets.map((ds) => ds.id));
    }

    const routineCalls = [];
    for (let dataSetId of dataSetCollection.get()) {
      let routineName = this._outProjMeta.get(routineId)!.outputFileClassName;
      let dataset = routine.dataSets.find((ds) => ds.id === dataSetId)!;
      let datasetName = createCleanName(dataset.name);
      let finalRoutineClassName = `${routineName}${datasetName}`;
      routineCalls.push(`await new ${finalRoutineClassName}(this).RunAsync();`);
    }

    return routineCalls;
  }

  private generateComment(step: ITestStepComment) {
    return this._commonCsharpTemplateProvider.getComment(step.comment!);
  }

  protected generateTestRoutineBody(testRoutine: ITestRoutine, pages: IPage[], datasetInfo: IDataSetInfo) {
    let stepItems = [];
    for (let [stepIndex, step] of testRoutine.steps.entries()) {
      if (step.type === "testStep") {
        let pageName = "";
        let elementName = "";

        if (step.page) {
          let pageId = step.page;
          let page = pages.find((p) => p.id === pageId);
          if (!page) {
            throw new Error("DEV ERROR: " + `Cannot find page with ID ${step.page}`);
          }
          pageName = this._outProjMeta.get(page.id)!.outputFileClassName;

          if (step.element) {
            let elementId = step.element;
            let element = page.elements.find((e) => e.id === elementId);
            if (!element) {
              throw new Error("DEV ERROR: " + `Cannot find element with ID ${elementId} on page ${pageName}`);
            }
            elementName = element.name || "";
          }
        }

        let actionData = this.getActionData(datasetInfo.values[stepIndex]);
        stepItems.push(
          this._commonCsharpTemplateProvider.getAction({
            pageName: pageName,
            elementName: upperCaseFirstChar(elementName),
            action: step.action! as unknown as ActionType,
            data: actionData,
            parameters: step.parameters || [],
          })
        );
        continue;
      }

      if (step.type === "comment") {
        // Add an empty line before the comment
        stepItems.push("");
        stepItems.push(this._commonCsharpTemplateProvider.getComment(step.comment!));
      }
    }

    let testcaseBody = stepItems.join(EOL);

    // If there is no step, we add an `await` so that there is no build warning about `async` method
    if (testcaseBody.length === 0) {
      testcaseBody = `await Task.CompletedTask;`;
    }

    // Indent test method body with 1 indent;
    testcaseBody = addIndent(testcaseBody, this._indentString, 2);
    return testcaseBody;
  }

  private getActionData(rawData: any): IActionData {
    if (CommonPlaywrightCsharpCodeGen.EnvironmentVariableDataRegex.test(rawData)) {
      let groups = CommonPlaywrightCsharpCodeGen.EnvironmentVariableDataRegex.exec(rawData)!;
      let varName = groups[1];
      return {
        rawData: varName,
        dataType: ActionDataType.EnvironmentVar,
      };
    }

    return {
      rawData: String(rawData),
      dataType: ActionDataType.LiteralValue,
    };
  }

  protected generateTestCaseFile(testCase: ITestCase, pages: IPage[], routines: ITestRoutine[]) {
    const testcaseBody = this.generateTestCaseBody(testCase, pages, routines);

    const routineUsings = this.generateRoutineUsings(testCase, routines);

    let testFile = this._commonCsharpTemplateProvider.getTestCaseFile(
      this._outProjMeta.get(testCase.id)!.outputFileClassName,
      testCase.description,
      testcaseBody,
      this._rootNamespace,
      this._outProjMeta.get(testCase.id)!.outputFileFullNamespace,
      routineUsings
    );
    return testFile;
  }

  protected generatePage(page: IPage): string {
    let pageItems = [];
    for (let element of page.elements) {
      if (element.type === "pageElement") {
        pageItems.push(
          this._commonCsharpTemplateProvider.getLocator({
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
        pageItems.push(this._commonCsharpTemplateProvider.getComment(element.comment!));
      }
    }

    let pageBody = pageItems.join(EOL + EOL);

    // Indent the output with 1 indent
    pageBody = addIndent(pageBody, this._indentString);

    let fullNamespace = this._outProjMeta.get(page.id)!.outputFileFullNamespace;
    let pageClassName = this._outProjMeta.get(page.id)!.outputFileClassName;

    return this._commonCsharpTemplateProvider.getPage(fullNamespace, pageClassName, page.description || "", pageBody);
  }

  protected async generatePageFiles(writeFile: WriteFileFn) {
    for (let page of this._projMeta.pages) {
      let pageContent = this.generatePage(page.content);
      let fileRelPath = this._outProjMeta.get(page.content.id)!.outputFileRelPath;
      await writeFile(fileRelPath, pageContent);
    }
  }

  protected async generateTestCaseFiles(writeFile: WriteFileFn) {
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

  protected async generateRoutineFiles(writeFile: WriteFileFn) {
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

  protected generatePageDefinitionsFileContent(pages: IPage[]): string {
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
      propertyInitList.push(`${pageName} = new ${pageName}(pageTest);`);
    }

    let propertyInits = propertyInitList.join(EOL);
    propertyInits = addIndent(propertyInits, this._indentString, 2);

    return this._commonCsharpTemplateProvider.getPageDefinitions(
      this._rootNamespace,
      usings,
      propertyDeclarations,
      propertyInits
    );
  }

  protected async generateSupportFiles(writeFile: WriteFileFn) {
    await writeFile(
      `${StandardOutputFolder.Support}/${StandardOutputFile.BasePageTest}${this._outputFileExt}`,
      this._commonCsharpTemplateProvider.getBasePageTestFile(this._rmprojFile.content.rootNamespace)
    );

    await writeFile(
      `${StandardOutputFolder.Support}/${StandardOutputFile.PageBase}${this._outputFileExt}`,
      this._commonCsharpTemplateProvider.getBasePageFile(this._rmprojFile.content.rootNamespace)
    );

    await writeFile(
      `${StandardOutputFolder.Support}/${StandardOutputFile.TestCaseBase}${this._outputFileExt}`,
      this._commonCsharpTemplateProvider.getTestCaseBase(this._rmprojFile.content.rootNamespace)
    );

    await writeFile(
      `${StandardOutputFolder.Support}/${StandardOutputFile.TestRoutineBase}${this._outputFileExt}`,
      this._commonCsharpTemplateProvider.getTestRoutineBaseFile(this._rmprojFile.content.rootNamespace)
    );
  }

  protected async generatePageDefinitionsFile(writeFile: WriteFileFn) {
    await writeFile(
      `${StandardOutputFile.PageDefinitions}${this._outputFileExt}`,
      this.generatePageDefinitionsFileContent(this._projMeta.pages.map((p) => p.content))
    );
  }

  private generateTestRoutineFile(testRoutine: ITestRoutine, testRoutineClasses: string[]) {
    let routineFileContent = this._commonCsharpTemplateProvider.getTestRoutineFile(
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

    let routineFileContent = this._commonCsharpTemplateProvider.getTestRoutineClass(
      finalOutputClassName,
      testRoutine.description,
      testRoutineBody
    );

    return routineFileContent;
  }
}
