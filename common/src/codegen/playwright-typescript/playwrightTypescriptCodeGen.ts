import path from "path";
import {
  ActionType,
  ISourceProjectMetadata,
  ITestCase,
  ITestCaseActionStep,
  ITestRoutine,
  ITestSuite,
  LocatorType,
  StandardFolder,
  StandardOutputFolderTypeScript,
} from "../../file-defs";
import { IPage } from "../../file-defs/pageFile";
import { StandardOutputFile } from "../../file-defs/standardOutputFile";
import { ActionDataType, IActionData, ICodeGen, WriteFileFn } from "../types";
import { PlaywrightTypescriptTemplateProvider } from "./templateProvider";
import { DataSetCollection, IDataSetInfo } from "../playwright-charp-common/dataSetInfo";
import { CodeGenBase } from "../codegen-common/codeGenBase";
import { lowerCaseFirstChar, upperCaseFirstChar } from "../utils/stringUtils";
import { EOL } from "os";
import { PlaywrightTypeScriptProjMetaGenerator } from "./playwrightTypeScriptMetaGenerator";
import { IOutputProjectMetadataGenerator } from "../playwright-charp-common/outputProjectMetadataProcessor";
import { createCleanName } from "../utils/createName";
import { ITestStepComment } from "../../file-defs/shared";
import { addIndent } from "../utils/codegenUtils";
import { createOutputProjectMetadata } from "../codegenOutputProjectMeta";
import generateDatasetInfos from "../playwright-charp-common/generateDatasetInfos";

export class PlaywrightTypeScriptCodeGen extends CodeGenBase implements ICodeGen {
  _templateProvider: PlaywrightTypescriptTemplateProvider;
  _outProjMeta: IOutputProjectMetadataGenerator;

  constructor(projMeta: ISourceProjectMetadata) {
    super(projMeta);
    this._templateProvider = new PlaywrightTypescriptTemplateProvider(
      path.join(this._rmprojFile.folderPath, StandardFolder.CustomCode, "templates"),
      this._rmprojFile.content.indent,
      this._rmprojFile.content.indentSize
    );

    this._outProjMeta = this.getOutProjMeta();
  }

  protected getOutProjMeta(): IOutputProjectMetadataGenerator {
    return new PlaywrightTypeScriptProjMetaGenerator(this._projMeta);
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

  private async generateEnvironmentSettingsFile(writeFile: WriteFileFn) {
    // Aggregate all variable names in all config file
    let allNames: string[] = [];
    for (let configFile of this._projMeta.environmentFiles) {
      let namesInFile = configFile.content.settings.map((setting) => setting.name);
      allNames.push(...namesInFile);
    }
    allNames = Array.from(new Set(allNames));
    const content = this._templateProvider.getEnvironmentSettingsFiles(allNames);

    await writeFile(
      `${StandardOutputFolderTypeScript.Config}/${StandardOutputFile.EnvironmentSettings}${this._outputFileExt}`,
      content
    );
  }

  private async generateProjectFiles(writeFile: WriteFileFn) {}

  private async generateMetaFiles(writeFile: WriteFileFn) {
    // Write output project metadata
    const outputProjectMetadata = await createOutputProjectMetadata(this._rmprojFile);
    await writeFile(StandardOutputFile.MetaData, JSON.stringify(outputProjectMetadata, null, 2));
  }
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
    await writeFile(
      `${StandardOutputFolderTypeScript.Support}/${StandardOutputFile.TestRoutineBase}${this._outputFileExt}`,
      this._templateProvider.getTestRoutineBase()
    );
    await writeFile(
      `${StandardOutputFolderTypeScript.Support}/${StandardOutputFile.ExtendPlaywright}${this._outputFileExt}`,
      this._templateProvider.getExtendPlaywrightFile()
    );

    await writeFile(
      `${StandardOutputFile.NodePackage}`,
      this._templateProvider.getNodePackageFile(this._projMeta.project.content.name)
    );

    await writeFile(`${StandardOutputFile.PlaywrightConfig}`, this._templateProvider.getPlaywrightConfigFile());
    await writeFile(`${StandardOutputFile.TsConfig}`, this._templateProvider.getTsConfigFile());
  }

  private async generateSuiteFiles(writeFile: WriteFileFn) {
    // Filename: TestSuites/{TestClassName}.cs
    for (let testSuite of this._projMeta.testSuites) {
      let fileRelPath = this._outProjMeta.get(testSuite.content.id)!.outputFileRelPath;
      let classContent = this.generateTestSuiteFile(
        testSuite.content,
        this._projMeta.testCases.map((tcFile) => tcFile.content)
      );
      await writeFile(fileRelPath, classContent);
    }
  }

  private async generatePageFiles(writeFile: WriteFileFn) {
    for (let page of this._projMeta.pages) {
      let filePath = this._outProjMeta.get(page.content.id)!.outputFileRelPath;
      await writeFile(filePath, this.generatePage(page.content));
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

      let testRoutineFile = this.generateTestRoutineFile(testRoutinesClasses);
      let outputFileRelPath = this._outProjMeta.get(testRoutine.id)!.outputFileRelPath;
      await writeFile(outputFileRelPath, testRoutineFile);
    }
  }

  private generatePageDefinitions(pages: IPage[]): string {
    let importStatements: string[] = [];
    for (let page of pages) {
      let pageNamespace = this._outProjMeta.get(page.id)!.outputFileFullNamespace;
      let pageName = this._outProjMeta.get(page.id)!.outputFileClassName;
      let importStatement = `import ${pageName} from "${pageNamespace}";`;
      if (!importStatements.includes(importStatement)) {
        importStatements.push(importStatement);
      }
    }

    let allImports = importStatements.join(EOL);

    let pagesDeclarationItems = [];
    for (let page of pages) {
      let pageName = upperCaseFirstChar(this._outProjMeta.get(page.id)!.outputFileClassName);
      pagesDeclarationItems.push(`public readonly ${pageName}: ${pageName};`);
    }
    let pagesDeclarations = pagesDeclarationItems.join(EOL);
    pagesDeclarations = addIndent(pagesDeclarations, this._indentString);
    //
    // Build constructor body
    // Example:
    // this.LoginPage = new LoginPage(this);
    //
    let pageInitItems = [];
    for (let page of pages) {
      let pageName = upperCaseFirstChar(this._outProjMeta.get(page.id)!.outputFileClassName);
      pageInitItems.push(`this.${pageName} = new ${pageName}(pageTest);`);
    }

    let pageInits = pageInitItems.join(EOL);
    pageInits = addIndent(pageInits, this._indentString, 2);

    return this._templateProvider.getPageDefinitions(allImports, pagesDeclarations, pageInits);
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
            //hasParams: hasPlaceholder(element.locator!),
            returnedLocatorType:
              element.findBy! === LocatorType.IFrame ||
              element.findBy! === LocatorType.IFrameId ||
              element.findBy! === LocatorType.IFrameName
                ? "FrameLocator"
                : "Locator",
          })
        );
        continue;
      }
      if (element.type === "comment") {
        pageItems.push(""); // Add an empty line before comment
        pageItems.push(this._templateProvider.getComment(element.comment!));
      }
    }

    let pageBody = pageItems.join(EOL + EOL);
    pageBody = addIndent(pageBody, this._indentString);

    return this._templateProvider.getPage(page.description || "", pageBody);
  }

  private generateTestSuiteFile(testSuite: ITestSuite, testcases: ITestCase[]) {
    const testcaseMethods: string[] = [];
    const importStatements: string[] = [];

    for (let testcaseId of testSuite.testcases) {
      let testcase = testcases.find((tc) => tc.id === testcaseId);
      if (!testcase) {
        throw new Error("DEV ERROR: cannot find testcase with id: " + testcaseId);
      }
      let testCaseFileMeta = this._outProjMeta.get(testcase.id)!;

      let fullNamespace = testCaseFileMeta.outputFileFullNamespace;
      let className = testCaseFileMeta.outputFileClassName;

      let usingDirective = `import ${className} from "${fullNamespace}";`;
      if (!importStatements.includes(usingDirective)) {
        importStatements.push(usingDirective);
      }

      let testcaseFunction = this.generateTestCaseFunction(testcase);
      testcaseMethods.push(testcaseFunction);
    }
    let imports = importStatements.join(EOL);
    let classBody = testcaseMethods.join(EOL + EOL);

    let testClass = this._templateProvider.getTestSuiteFile(
      imports,
      this._outProjMeta.get(testSuite.id)!.outputFileClassName,
      testSuite.description,
      classBody
    );
    return testClass;
  }

  private generateTestRoutineFile(testRoutineClasses: string[]) {
    let routineFileContent = this._templateProvider.getTestRoutineFile(testRoutineClasses);
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
          this._templateProvider.getAction({
            pageName: pageName,
            elementName: lowerCaseFirstChar(elementName),
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
        stepItems.push(this._templateProvider.getComment(step.comment!));
      }
    }

    let testcaseBody = stepItems.join(EOL);

    // If there is no step, we add an `await` so that there is no build warning about `async` method
    if (testcaseBody.length === 0) {
      testcaseBody = `await Task.CompletedTask;`;
    }

    // Indent test method body with 2 indent;
    testcaseBody = addIndent(testcaseBody, this._indentString, 2);
    return testcaseBody;
  }

  private generateTestCaseFile(testCase: ITestCase, pages: IPage[], routines: ITestRoutine[]) {
    const testcaseBody = this.generateTestCaseBody(testCase, pages, routines);
    const routineImports = this.generateRoutineImports(testCase, routines);
    const testCaseName = this._outProjMeta.get(testCase.id)!.outputFileClassName;
    let testFile = this._templateProvider.getTestCaseFile(
      testCaseName,
      routineImports,
      testCase.description,
      testcaseBody
    );
    return testFile;
  }

  /** Generates import routine statements for a test case */
  private generateRoutineImports(testCase: ITestCase, routines: ITestRoutine[]): string[] {
    const runTestRoutineSteps: ITestCaseActionStep[] = testCase.steps
      .filter((s) => s.type === "testStep" && s.action === "RunTestRoutine")
      .map((s) => s as ITestCaseActionStep);

    const allRoutineImports: string[] = [];
    for (let step of runTestRoutineSteps) {
      let { routineImportNames, routineImportFile } = this.getRoutineImportNames(step, routines);
      if (routineImportNames.length) {
        allRoutineImports.push(`import { ${routineImportNames.join(", ")} } from "${routineImportFile}";`);
      }
    }
    return allRoutineImports;
  }

  /** Gets routine import class names. Each routine class name is specified by the routine and the selected data sets. */
  private getRoutineImportNames(
    step: ITestCaseActionStep,
    routines: ITestRoutine[]
  ): { routineImportFile: string; routineImportNames: string[] } {
    let routineId = step.data;
    if (!routineId) {
      return { routineImportFile: "", routineImportNames: [] };
    }

    let routine = routines.find((r) => r.id === routineId);

    if (!routine) {
      throw new Error(`DEV ERROR: routine with id "${routineId}" not found`);
    }

    let routineMeta = this._outProjMeta.get(routineId)!;

    let dataSetCollection = new DataSetCollection(step.parameters);

    if (dataSetCollection.isAll()) {
      dataSetCollection.empty();
      dataSetCollection.addMany(routine.dataSets.map((ds) => ds.id));
    }

    const routineImportNames = [];
    for (let dataSetId of dataSetCollection.get()) {
      let routineName = routineMeta.outputFileClassName;
      let dataset = routine.dataSets.find((ds) => ds.id === dataSetId)!;
      let datasetName = createCleanName(dataset.name);
      let finalRoutineClassName = `${routineName}${datasetName}`;
      routineImportNames.push(finalRoutineClassName);
    }

    return { routineImportFile: routineMeta.outputFileFullNamespace, routineImportNames };
  }

  protected generateTestCaseBody(testCase: ITestCase, pages: IPage[], routines: ITestRoutine[]): string {
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
      body = `await delay(0);`;
    }

    // Indent test method body with 2 indent;
    body = addIndent(body, this._indentString, 2);
    return body;
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
      this._templateProvider.getAction({
        pageName: pageName,
        elementName: lowerCaseFirstChar(elementName),
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
      routineCalls.push(`await new ${finalRoutineClassName}(this).run();`);
    }

    return routineCalls;
  }

  private getActionData(rawData: any): IActionData {
    if (this.EnvironmentVariableDataRegex.test(rawData)) {
      let groups = this.EnvironmentVariableDataRegex.exec(rawData)!;
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

  private generateComment(step: ITestStepComment) {
    return this._templateProvider.getComment(step.comment!);
  }

  private generateTestCaseFunction(testCase: ITestCase) {
    const testcaseName = this._outProjMeta.get(testCase.id)!.outputFileClassName;
    const testCaseMethod = this._templateProvider.getTestFunction(testcaseName, testCase.description);
    return testCaseMethod;
  }
}
