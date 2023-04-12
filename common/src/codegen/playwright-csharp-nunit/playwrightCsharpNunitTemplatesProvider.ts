import { EOL } from "os";
import path from "path";
import { ActionType, Indent, LocatorType } from "../../file-defs";
import { IActionTemplateParam, ILocatorTemplateParam } from "../types";
import { actionRegistyDotnet } from "../utils/action-registry-dotnet";
import { locatorRegistyDotnet } from "../utils/locator-registry-dotnet";
import { getParameters, escapeStr, hasPlaceholder, upperCaseFirstChar } from "../utils/stringUtils";
import { NunitTemplateCollection } from "./templateCollection";

export class PlaywrightCsharpNunitTemplatesProvider {
  private _templateCollection: NunitTemplateCollection;

  constructor(customTemplatesDir: string) {
    this._templateCollection = new NunitTemplateCollection(path.resolve(__dirname, "./templates"), customTemplatesDir, ".hbs");
  }

  getTestClass(usings: string, name: string, description: string, body: string, rootNamespace: string, fullNamespace: string) {
    return this._templateCollection.TEST_CLASS_TEMPLATE({ usings, name, description, body, rootNamespace, fullNamespace });
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

  getTestFunction(name: string, description: string) {
    return this._templateCollection.TEST_FUNCTION_TEMPLATE({ name, description });
  }

  getLocatorHelper(rootNamespace: string): string {
    return this._templateCollection.LOCATOR_HELPER_TEMPLATE({ rootNamespace });
  }
  getSingleCaseSuiteBase(rootNamespace: string): string {
    return this._templateCollection.SINGLE_CASE_SUITE_BASE({ rootNamespace });
  }
  getCSProject(rootNamespace: string) {
    return this._templateCollection.CSPROJECT_TEMPLATE({ rootNamespace });
  }
  getNUNitUsing() {
    return this._templateCollection.USINGS_TEMPLATE({});
  }
  getRunSettings() {
    return this._templateCollection.RUNSETTINGS_TEMPLATE({});
  }

  getPageDefinitions(usings: string, rootNamespace: string, pageDeclaration: string, body: string) {
    return this._templateCollection.PAGE_DEFINITIONS_TEMPLATE({ usings, rootNamespace, pageDeclaration, body });
  }

  getPage(fullNamespace: string, pageName: string, pageDescription: string, pageBody: string) {
    return this._templateCollection.PAGE_TEMPLATE({ fullNamespace, pageName, pageDescription, pageBody });
  }

  getComment(message: string) {
    return this._templateCollection.COMMENT_TEMPLATE({ message });
  }
}
