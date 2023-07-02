import path from "path";
import { Indent } from "../../file-defs";
import { indentCharMap, lowerCaseFirstChar, upperCaseFirstChar } from "../utils/stringUtils";
import { actionRegistyPlaywright } from "./action-registry";
import { JestTemplateCollection } from "./templateCollection";
import { locatorRegisty } from "./locator-registry";
import { IActionTemplateParam, ILocatorTemplateParam } from "../types";

export class PlaywrightTypescriptTemplateProvider {
  private _templateCollection: JestTemplateCollection;

  private _indentChar: string;
  private _indentString: string;

  constructor(customTemplatesDir: string, indent: Indent = Indent.Spaces, indentSize: number = 4) {
    this._templateCollection = new JestTemplateCollection(
      path.resolve(__dirname, "./templates"),
      customTemplatesDir,
      ".hbs"
    );
    this._indentChar = indentCharMap.get(indent)!;
    this._indentString = this._indentChar.repeat(indentSize);
  }

  private Indent(sourceStr: string, indentSpaces?: number) {
    let lines = sourceStr.split(/\r?\n/);

    if (indentSpaces === undefined) {
      let result = lines.map((l) => this._indentString + l).join("\n");
      return result;
    }

    let indentString = new Array(indentSpaces + 1).join(" ");
    let result = lines.map((l) => indentString + l).join("\n");
    return result;
  }

  getAction(params: IActionTemplateParam) {
    const actionGenerate = actionRegistyPlaywright.get(params.action);
    if (!actionGenerate) {
      throw new Error("(DEV) Action is not support: " + params.action);
    }

    return actionGenerate(params);
  }

  getLocator(params: ILocatorTemplateParam) {
    let { elementName, locatorType, returnedLocatorType, description } = params;

    const generateGetter = locatorRegisty.get(locatorType);

    if (!generateGetter) {
      throw new Error("(DEV) LocatorType is not supported: " + locatorType);
    }
    const getter = generateGetter(params);

    let output = this._templateCollection.LOCATOR_FILE({
      hasParams: params.hasParams,
      elementName: lowerCaseFirstChar(elementName),
      getter,
      description,
      returnedLocatorType,
    });

    return output;
  }

  getTestCaseBase() {
    return this._templateCollection.TEST_CASE_BASE_FILE({});
  }
  getPageBase() {
    return this._templateCollection.PAGE_BASE_FILE({});
  }
  getPageTest() {
    return this._templateCollection.PAGE_TEST_FILE({});
  }
  getNodePackageFile() {
    return this._templateCollection.NODE_PACKAGE_FILE({});
  }

  getTsConfigFile() {
    return this._templateCollection.TS_CONFIG_FILE({});
  }

  getPlaywrightConfigFile() {
    return this._templateCollection.PLAYWRIGHT_CONFIG_FILE({});
  }

  getTestCase(name: string, body: string) {
    return this._templateCollection.TEST_CASE_FILE({ name, body });
  }

  getPageDefinitions(pageImports: string, pageDeclarations: string, pageAssignments: string) {
    return this._templateCollection.PAGE_DEFINITIONS_FILE({ pageImports, pageDeclarations, pageAssignments });
  }

  getPageImport(pageName: string) {
    return `import { ${upperCaseFirstChar(pageName)} } from "./pages/${lowerCaseFirstChar(pageName)}";`;
  }

  getPageAssignment(pageName: string) {
    let indent = this._indentString.repeat(2);
    return `${indent}this.${lowerCaseFirstChar(pageName)} = new ${upperCaseFirstChar(pageName)}(page);`;
  }

  getPageProperty(pageName: string) {
    let indent = this._indentString;
    return `${indent}public ${lowerCaseFirstChar(pageName)}: ${upperCaseFirstChar(pageName)};`;
  }

  getPage(pageName: string, pageDescription: string | undefined, pageBody: string) {
    return this._templateCollection.PAGE_FILE({ pageName, pageDescription, pageBody });
  }

  GetComment(message: string) {
    return this._templateCollection.COMMENT({ message, indent: this._indentString });
  }
}
