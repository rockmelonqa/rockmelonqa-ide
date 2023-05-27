import path from "path";
import { IActionTemplateParam, ILocatorTemplateParam } from "../types";
import { upperCaseFirstChar } from "../utils/stringUtils";
import { XUnitTemplateCollection } from "./templateCollection";
import { IDataSetInfo } from "../playwright-charp-common/dataSetInfo";
import { actionRegistyDotnet } from "../playwright-charp-common/action-registry-dotnet";
import { locatorRegistyDotnet } from "../playwright-charp-common/locator-registry-dotnet";

export class PlaywrightCsharpXUnitTemplatesProvider {
  private _templateCollection: XUnitTemplateCollection;

  constructor(customTemplatesDir: string) {
    this._templateCollection = new XUnitTemplateCollection(path.resolve(__dirname, "./templates"), customTemplatesDir, ".hbs");
  }

  getTestSuiteFile(usings: string, name: string, description: string, body: string, rootNamespace: string, fullNamespace: string) {
    return this._templateCollection.TEST_SUITE_FILE({ usings, name, description, body, rootNamespace, fullNamespace });
  }

  getTestCaseFile(testCaseName: string, description: string, body: string, rootNamespace: string, fullNamespace: string) {
    return this._templateCollection.TEST_CASE_FILE({
      rootNamespace,
      testCaseName,
      description,
      body,
      fullNamespace,
    });
  }

  getTestCaseAction(params: IActionTemplateParam) {
    const actionGenerate = actionRegistyDotnet.get(params.action);
    if (!actionGenerate) {
      throw new Error("(DEV) Action is not support: " + params.action);
    }

    return actionGenerate(params);
  }

  getTestRoutineFile(
    testRoutineName: string,
    description: string,
    body: string,
    rootNamespace: string,
    fullNamespace: string,
    datasets: IDataSetInfo[]
  ) {
    return this._templateCollection.TEST_ROUTINE_FILE({
      rootNamespace,
      testRoutineName,
      description,
      body,
      fullNamespace,
      datasets,
    });
  }

  getRoutineAction(params: IActionTemplateParam) {
    const actionGenerate = actionRegistyDotnet.get(params.action);
    if (!actionGenerate) {
      throw new Error("(DEV) Action is not support: " + params.action);
    }

    return actionGenerate(params);
  }

  getLocator(params: ILocatorTemplateParam) {
    let { elementName, locatorType, returnedLocatorType, description } = params;

    if (!locatorType) {
      throw new Error("(DEV) LocatorType required. Current locatorType value is " + locatorType);
    }

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

  getTestFunction(name: string, description: string) {
    return this._templateCollection.TEST_FUNCTION({ name, description });
  }

  getLocatorHelper(rootNamespace: string): string {
    return this._templateCollection.LOCATOR_HELPER_FILE({ rootNamespace });
  }
  getBaseClasses(rootNamespace: string, testIdAttributeName: string): string {
    return this._templateCollection.BASE_CLASSES_FILE({ rootNamespace, testIdAttributeName });
  }
  getCSProject(rootNamespace: string) {
    return this._templateCollection.CSPROJECT_FILE({ rootNamespace });
  }
  getUsings(rootNamespace: string) {
    return this._templateCollection.USINGS_FILE({ rootNamespace });
  }
  getRunSettings() {
    return this._templateCollection.RUNSETTINGS_FILE({});
  }

  getPageDefinitions(usings: string, rootNamespace: string, pageDeclaration: string, body: string) {
    return this._templateCollection.PAGE_DEFINITIONS_FILE({ usings, rootNamespace, pageDeclaration, body });
  }

  getPage(fullNamespace: string, pageName: string, pageDescription: string, pageBody: string) {
    return this._templateCollection.PAGE_FILE({ fullNamespace, pageName, pageDescription, pageBody });
  }

  getComment(message: string) {
    return this._templateCollection.COMMENT({ message });
  }
}
