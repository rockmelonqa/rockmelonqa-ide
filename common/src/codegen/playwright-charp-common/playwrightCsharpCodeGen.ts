import { EOL } from "os";
import {
  ActionType,
  ISourceProjectMetadata,
  ITestCase,
  ITestRoutine,
  StandardOutputFile,
  StandardOutputFolder,
} from "../../file-defs";
import { IPage } from "../../file-defs/pageFile";
import { upperCaseFirstChar } from "../utils/stringUtils";
import { IOutputProjectMetadataProcessor } from "./outputProjectMetadataProcessor";
import { createCleanName } from "../utils/createName";
import { DataSetCollection, IDataSetInfo } from "./dataSetInfo";
import { IPlaywrightCsharpTemplatesProvider } from "./playwrightCsharpTemplatesProvider";
import { ActionDataType, IActionData, WriteFileFn } from "../types";
import { ITestCaseActionStep } from "../../file-defs/testCaseFile";
import { ITestStepComment } from "../../file-defs/shared";
import { CodeGenBase } from "../codegen-common/codeGenBase";
import { addIndent } from "../utils/codegenUtils";

/** Base class for Dotnet CodeGe, including MsTest, Nunit, Xunit CodeGens */
export class PlaywrightCsharpCodeGen extends CodeGenBase {
  protected _outProjMeta: IOutputProjectMetadataProcessor;
  protected _templateProvider: IPlaywrightCsharpTemplatesProvider;

  protected _rootNamespace: string;

  constructor(projMeta: ISourceProjectMetadata) {
    super(projMeta);

    this._projMeta = projMeta;
    this._rootNamespace = projMeta.project.content.rootNamespace;

    this._outProjMeta = this.getOutProjMeta();
    this._templateProvider = this.getTemplateProvider();
  }

  protected getOutProjMeta(): IOutputProjectMetadataProcessor {
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
    const content = this._templateProvider.getEnvironmentSettingsFiles(
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

    let routineBody = stepItems.join(EOL);

    // If there is no step, we add an `await` so that there is no build warning about `async` method
    if (routineBody.length === 0) {
      routineBody = `await Task.CompletedTask;`;
    }

    // Indent test method body with 1 indent;
    routineBody = addIndent(routineBody, this._indentString.repeat(2));
    return routineBody;
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
      routineCalls.push(`await new ${finalRoutineClassName}(this.Page).RunAsync();`);
    }

    return routineCalls;
  }

  private generateComment(step: ITestStepComment) {
    return this._templateProvider.getComment(step.comment!);
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
        stepItems.push(this._templateProvider.getComment(step.comment!));
      }
    }

    let testcaseBody = stepItems.join(EOL);

    // If there is no step, we add an `await` so that there is no build warning about `async` method
    if (testcaseBody.length === 0) {
      testcaseBody = `await Task.CompletedTask;`;
    }

    // Indent test method body with 1 indent;
    testcaseBody = addIndent(testcaseBody, this._indentString.repeat(2));
    return testcaseBody;
  }

  private getActionData(rawData: any): IActionData {
    if (PlaywrightCsharpCodeGen.EnvironmentVariableDataRegex.test(rawData)) {
      let groups = PlaywrightCsharpCodeGen.EnvironmentVariableDataRegex.exec(rawData)!;
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

  /** Regex to test for Environment variable data: e.g "{TestUser}", "{TestPassword}" */
  private static readonly EnvironmentVariableDataRegex = /{(.+)}/;
}
