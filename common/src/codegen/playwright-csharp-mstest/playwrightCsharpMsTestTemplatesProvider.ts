import path from "path";
import { IActionTemplateParam, ILocatorTemplateParam } from "../types";
import { upperCaseFirstChar } from "./../utils/stringUtils";
import { MsTestTemplateCollection } from "./templateCollection";
import { IPlaywrightCsharpTemplatesProvider } from "../playwright-charp-common/playwrightCsharpTemplatesProvider";
import { actionRegistyDotnet } from "../playwright-charp-common/action-registry-dotnet";
import { locatorRegistyDotnet } from "../playwright-charp-common/locator-registry-dotnet";
import { BasePlaywrightDotnetTemplatesProvider } from "../playwright-charp-common/basePlaywrightDotnetTemplatesProvider";
import { Indent } from "../../file-defs";

export class PlaywrightCsharpMsTestTemplatesProvider
  extends BasePlaywrightDotnetTemplatesProvider
  implements IPlaywrightCsharpTemplatesProvider
{
  private _templateCollection: MsTestTemplateCollection;

  constructor(customTemplatesDir: string, requiredIndenChar: Indent, requiredIndexSize: number) {
    super();
    this._templateCollection = new MsTestTemplateCollection({
      templatesDir: path.resolve(__dirname, "./templates"),
      customTemplatesDir,
      fileExtension: ".hbs",
      requiredIndentChar: requiredIndenChar,
      requiredIndentSize: requiredIndexSize,
      sourceIndentChar: Indent.Spaces,
      sourceIndentSize: 4,
    });
  }

  getEnvironmentSettingsFiles(rootNamespace: string, allVariableNames: string[]): string {
    return this._templateCollection.ENVIRONMENT_SETTINGS_FILE({ rootNamespace, allVariableNames });
  }

  getTestSuiteFile(
    usings: string,
    name: string,
    description: string,
    body: string,
    rootNamespace: string,
    fullNamespace: string
  ) {
    return this._templateCollection.TEST_SUITE_FILE({ usings, rootNamespace, name, description, body, fullNamespace });
  }

  getTestSuiteBase(rootNamespace: string, testIdAttributeName: string) {
    return this._templateCollection.TEST_SUITE_BASE_FILE({ rootNamespace, testIdAttributeName });
  }

  getTestCaseFile(
    testCaseName: string,
    description: string,
    body: string,
    rootNamespace: string,
    fullNamespace: string,
    usings: string[]
  ) {
    return this._templateCollection.TEST_CASE_FILE({
      rootNamespace,
      testCaseName,
      description,
      body,
      fullNamespace,
      usings,
    });
  }

  getTestRoutineClass(testRoutineName: string, description: string, body: string) {
    return this._templateCollection.TEST_ROUTINE_CLASS({
      testRoutineName,
      description,
      body,
    });
  }

  getTestRoutineFile(rootNamespace: string, fullNamespace: string, testRoutineClasses: string[]) {
    return this._templateCollection.TEST_ROUTINE_FILE({
      rootNamespace,
      fullNamespace,
      testRoutineClasses,
    });
  }

  getAction(params: IActionTemplateParam) {
    const actionGenerateFn = actionRegistyDotnet.get(params.action);

    if (!actionGenerateFn) {
      throw new Error("(DEV ERROR) Action is not support: " + params.action);
    }

    return actionGenerateFn(params);
  }

  getLocator(params: ILocatorTemplateParam) {
    let { elementName, locatorType, returnedLocatorType, description } = params;

    const generateGetter = locatorRegistyDotnet.get(locatorType);

    if (!generateGetter) {
      throw new Error("(DEV) LocatorType is not supported: " + locatorType);
    }
    const getter = generateGetter(params);

    let output = this._templateCollection.PAGE_ELEMENT_PROPERTY({
      hasParams: params.hasParams,
      elementName: upperCaseFirstChar(elementName),
      getter,
      description,
      returnedLocatorType,
    });

    return output;
  }

  getComment(message: string) {
    return this._templateCollection.COMMENT({ message });
  }

  getTestFunction(name: string, description: string) {
    return this._templateCollection.TEST_FUNCTION({ name, description });
  }

  getCsProject(rootNamespace: string) {
    return this._templateCollection.CSPROJECT_FILE({ rootNamespace });
  }
  getUsings(rootNamespace: string, hasRoutines: boolean) {
    return this._templateCollection.USINGS_FILE({ rootNamespace, hasRoutines });
  }
  getRunSettings() {
    return this._templateCollection.RUNSETTINGS_FILE({});
  }

  getTestCaseBase(rootNamespace: string) {
    return this._templateCollection.TEST_CASE_BASE_FILE({ rootNamespace });
  }

  getPageDefinitions(rootNamespace: string, usings: string, pageDeclaration: string, body: string) {
    return this._templateCollection.PAGE_DEFINITIONS_FILE({ rootNamespace, usings, pageDeclaration, body });
  }

  getPage(fullNamespace: string, pageClassName: string, pageDescription: string, pageBody: string) {
    return this._templateCollection.PAGE_FILE({ fullNamespace, pageClassName, pageDescription, pageBody });
  }
}
