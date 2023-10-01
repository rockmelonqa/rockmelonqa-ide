/** Base class for PlaywrightDotnetTemplatesProvider */
import path from "path";
import { IActionTemplateParam, ILocatorTemplateParam } from "../types";
import { upperCaseFirstChar } from "../utils/stringUtils";
import { CommonCsharpTemplateCollection } from "./commonCsharpTemplateCollection";
import { IPlaywrightCsharpTemplatesProvider } from "./playwrightCsharpTemplatesProvider";
import { actionRegistyDotnet } from "./action-registry-dotnet";
import { locatorRegistyDotnet } from "./locator-registry-dotnet";
import { Indent } from "../../file-defs";

export class CommonPlaywrightCsharpTemplatesProvider {
  private _templateCollection: CommonCsharpTemplateCollection;

  constructor(customTemplatesDir: string, requiredIndenChar: Indent, requiredIndexSize: number) {
    this._templateCollection = new CommonCsharpTemplateCollection({
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

  getTestRoutineBaseFile(rootNamespace: string) {
    return this._templateCollection.TEST_ROUTINE_BASE_FILE({ rootNamespace });
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

  getTestCaseBase(rootNamespace: string) {
    return this._templateCollection.TEST_CASE_BASE_FILE({ rootNamespace });
  }

  getBasePageFile(rootNamespace: string): string {
    return this._templateCollection.BASE_PAGE_FILE({ rootNamespace });
  }
  getBasePageTestFile(rootNamespace: string): string {
    return this._templateCollection.BASE_PAGE_TEST_FILE({ rootNamespace });
  }

  getPageDefinitions(rootNamespace: string, usings: string, pageDeclaration: string, body: string) {
    return this._templateCollection.PAGE_DEFINITIONS_FILE({ rootNamespace, usings, pageDeclaration, body });
  }

  getPage(fullNamespace: string, pageClassName: string, pageDescription: string, pageBody: string) {
    return this._templateCollection.PAGE_FILE({ fullNamespace, pageClassName, pageDescription, pageBody });
  }
}
