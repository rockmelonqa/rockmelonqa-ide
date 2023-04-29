import path from "path";
import { IActionTemplateParam, ILocatorTemplateParam } from "../types";
import { actionRegistyDotnet } from "../utils/action-registry-dotnet";
import { locatorRegistyDotnet } from "../utils/locator-registry-dotnet";
import { upperCaseFirstChar } from "./../utils/stringUtils";
import { MsTestTemplateCollection } from "./templateCollection";

export class PlaywrightCsharpMsTestTemplatesProvider {
  private _templateCollection: MsTestTemplateCollection;

  constructor(customTemplatesDir: string) {
    this._templateCollection = new MsTestTemplateCollection(path.resolve(__dirname, "./templates"), customTemplatesDir, ".hbs");
  }

  getTestClass(usings: string, name: string, description: string, body: string, rootNamespace: string, fullNamespace: string) {
    return this._templateCollection.TEST_CLASS_TEMPLATE({ usings, rootNamespace, name, description, body, fullNamespace });
  }

  getTestCaseFile(testCaseName: string, description: string, body: string, rootNamespace: string, fullNamespace: string) {
    return this._templateCollection.TEST_CASE_FILE_TEMPLATE({ rootNamespace, testCaseName, description, body, fullNamespace });
  }

  getAction(params: IActionTemplateParam) {
    const actionGenerate = actionRegistyDotnet.get(params.action);
    if (!actionGenerate) {
      throw new Error("(DEV) Action is not support: " + params.action);
    }

    return actionGenerate(params);
  }

  getLocator(params: ILocatorTemplateParam) {
    let { elementName, locatorType, returnedLocatorType, description } = params;

    const generateGetter = locatorRegistyDotnet.get(locatorType);

    if (!generateGetter) {
      throw new Error("(DEV) LocatorType is not supported: " + locatorType);
    }
    const getter = generateGetter(params);

    let output = this._templateCollection.LOCATOR_TEMPLATE({
      hasParams: params.hasParams,
      elementName: upperCaseFirstChar(elementName),
      getter,
      description,
      returnedLocatorType,
    });

    return output;
  }

  GetComment(message: string) {
    return this._templateCollection.COMMENT({ message });
  }

  GetTestFunction(name: string, description: string) {
    return this._templateCollection.TEST_FUNCTION_TEMPLATE({ name, description });
  }

  GetCSProject(rootNamespace: string) {
    return this._templateCollection.CSPROJECT_TEMPLATE({ rootNamespace });
  }
  GetUsings() {
    return this._templateCollection.USINGS_TEMPLATE({});
  }
  GetRunSettings() {
    return this._templateCollection.RUNSETTINGS_TEMPLATE({});
  }

  GetRmTestSuiteBase(rootNamespace: string) {
    return this._templateCollection.TEST_CASE_BASE({ rootNamespace });
  }

  getPageDefinitions(rootNamespace: string, usings: string, pageDeclaration: string, body: string) {
    return this._templateCollection.PAGE_DEFINITIONS_TEMPLATE({ rootNamespace, usings, pageDeclaration, body });
  }

  GetLocatorHelper(rootNamespace: string) {
    return this._templateCollection.LOCATOR_HELPER_TEMPLATE({ rootNamespace });
  }

  GetPage(fullNamespace: string, pageClassName: string, pageDescription: string, pageBody: string) {
    return this._templateCollection.PAGE_TEMPLATE({ fullNamespace, pageClassName, pageDescription, pageBody });
  }
}
