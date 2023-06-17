import { EOL } from "os";
import {
  ActionType,
  IRmProjFile,
  ISetting,
  ISourceProjectMetadata,
  ITestCase,
  ITestRoutine,
  StandardFileExtension,
  StandardOutputFile,
  StandardOutputFolder,
} from "../../file-defs";
import { IPage } from "../../file-defs/pageFile";
import { addIndent, indentCharMap, upperCaseFirstChar } from "../utils/stringUtils";
import { IOutputProjectMetadataProcessor } from "./outputProjectMetadataProcessor";
import { createCleanName } from "../utils/createName";
import { languageExtensionMap } from "../utils/languageExtensionMap";
import { IDataSetInfo } from "./dataSetInfo";
import { IPlaywrightCsharpTemplatesProvider } from "./playwrightCsharpTemplatesProvider";
import { ActionDataType, IActionData, WriteFileFn } from "../types";
import path from "path";
import {
  IEnvironmentVariableFileGenerator,
  UnixEnvironmentVariableFileGenerator,
  WindowEnvironmentVariableFileGenerator,
} from "../codegen-common/environmentVariableFileGenerator";
import { Platform } from "../../file-defs/platform";

/** Base CodeGen for MsTest, Nunit, Xunit CodeGens */
export class PlaywrightCsharpCodeGen {
  protected _outProjMeta: IOutputProjectMetadataProcessor;
  protected _templateProvider: IPlaywrightCsharpTemplatesProvider;
  protected _indentString: string;
  protected _indentChar: string;
  protected _indentSize: number;
  protected _envVarFileGenerator: IEnvironmentVariableFileGenerator;

  protected _projMeta: ISourceProjectMetadata;
  protected _rmprojFile: IRmProjFile;
  protected _rootNamespace: string;
  protected _outputFileExt: string;

  constructor(projMeta: ISourceProjectMetadata) {
    const rmprojFile = projMeta.project;

    this._projMeta = projMeta;
    this._rmprojFile = rmprojFile;
    this._rootNamespace = rmprojFile.content.rootNamespace;

    this._outputFileExt = languageExtensionMap[rmprojFile.content.language];

    /** Space char of tab char */
    this._indentChar = indentCharMap.get(rmprojFile.content.indent)!;
    /** Size of 1 index: eg. 2 spaces or 4 spaces */
    this._indentSize = rmprojFile.content.indentSize;
    /** String representing 1 indent */
    this._indentString = this._indentChar.repeat(this._indentSize);

    this._outProjMeta = this.getOutProjMeta();
    this._templateProvider = this.getTemplateProvider();

    this._envVarFileGenerator = Platform.IsWindows()
      ? new WindowEnvironmentVariableFileGenerator()
      : new UnixEnvironmentVariableFileGenerator();
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
    const content = this._templateProvider.getEnvironmentSettingsFiles(this._rmprojFile.content.rootNamespace, allNames);
    await writeFile(`${StandardOutputFolder.Config}/${StandardOutputFile.EnvironmentSettings}${this._outputFileExt}`, content);
  }

  protected async generateEnvironmentSetterScripts(writeFile: WriteFileFn) {
    for (let configFile of this._projMeta.environmentFiles) {
      const fileContent = this._envVarFileGenerator.generate(configFile.content);
      const sourceFileNameWithoutExt = path.parse(configFile.fileName).name;
      const fileExt = Platform.IsWindows() ? StandardFileExtension.Bat : StandardFileExtension.Sh;
      await writeFile(`${StandardOutputFolder.DotEnvironment}/run.${sourceFileNameWithoutExt}.env${fileExt}`, fileContent);
    }

    // For Windows, generate a bat file that remove environment variable
    if (Platform.IsWindows()) {
      // Obtains all varnames from all config files
      let varnames = [];
      for (let configFile of this._projMeta.environmentFiles) {
        varnames.push(...configFile.content.settings.map((setting) => setting.name));
      }
      // Get unique name
      varnames = [...new Set(varnames)];

      // Generate the clear file
      const settings: ISetting[] = varnames.map((name) => ({ name, value: "" }));
      const fileContent = this._envVarFileGenerator.generate({ settings });
      await writeFile(`${StandardOutputFolder.DotEnvironment}${path.sep}rmv.env${StandardFileExtension.Bat}`, fileContent);
    }
  }

  protected generateTestCaseBody(testCase: ITestCase, pages: IPage[], routines: ITestRoutine[]) {
    let stepItems = [];
    for (let step of testCase.steps) {
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

        let actionData = this.getActionData(step.data);
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
        continue;
      }

      if (step.type === "routine") {
        stepItems.push("// Routine " + step.id);
        let routineId = step.routine!;
        let datasetId = step.dataset!;
        let routine = routines.find((r) => r.id === routineId)!;
        let routineName = this._outProjMeta.get(routineId)!.outputFileClassName;
        let dataset = routine.dataSets.find((ds) => ds.id === datasetId)!;
        let datasetName = createCleanName(dataset.name);
        let finalRoutineClassName = `${routineName}${datasetName}`;
        stepItems.push(`await new ${finalRoutineClassName}(this.Page).RunAsync();`);
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

  protected generateTestRoutineBody(testRoutine: ITestRoutine, pages: IPage[], datasetInfo: IDataSetInfo) {
    let stepItems = [];
    for (let stepIndex = 0; stepIndex < testRoutine.steps.length; stepIndex++) {
      let step = testRoutine.steps[stepIndex];
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
