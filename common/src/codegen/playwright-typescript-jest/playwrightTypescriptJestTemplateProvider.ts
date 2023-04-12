import path from "path";
import { Indent } from "../../file-defs";
import { IActionTemplateParam, ILocatorTemplateParam } from "../types";
import { lowerCaseFirstChar, upperCaseFirstChar } from "../utils/stringUtils";
import { actionRegisty } from "./action-registry";
import { JestTemplateCollection } from "./jestTemplateCollection";
import { locatorRegisty } from "./locator-registry";

export class PlaywrightTypescriptJestTemplateProvider {
  private _templateCollection: JestTemplateCollection;

  private _indent: Indent;
  private _indentChar: string;
  private _indentSize: number;
  private _indentString: string;

  private readonly indentCharMap = new Map<Indent, string>([
    [Indent.Tabs, "\t"],
    [Indent.Spaces, " "],
  ]);

  constructor(customTemplatesDir: string, indent: Indent = Indent.Spaces, indentSize: number = 4) {
    this._templateCollection = new JestTemplateCollection(path.resolve(__dirname, "./templates"), customTemplatesDir, ".hbs");
    this._indent = indent;
    this._indentChar = this.indentCharMap.get(indent)!;
    this._indentSize = indentSize;
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
    const actionGenerate = actionRegisty.get(params.action);
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

    let output = this._templateCollection.LOCATOR_TEMPLATE({
      hasParams: params.hasParams,
      elementName: lowerCaseFirstChar(elementName),
      getter,
      description,
      returnedLocatorType,
    });

    return output;
  }

  getTestFile(name: string, body: string) {
    return this._templateCollection.TEST_FILE_TEMPLATE({ name, body });
  }

  getNodePackageFile() {
    return this._templateCollection.NODE_PACKAGE_FILE_TEMPLATE({});
  }

  getTsConfigFile() {
    return this._templateCollection.TS_CONFIG_FILE_TEMPLATE({});
  }

  getPlaywrightConfigFile() {
    return this._templateCollection.PLAYWRIGHT_CONFIG_FILE_TEMPLATE({});
  }

  getJestConfigFile() {
    return this._templateCollection.JEST_CONFIG_FILE_TEMPLATE({});
  }

  getPrettierConfigFile() {
    return this._templateCollection.PRETTIER_CONFIG_FILE_TEMPLATE({});
  }

  getTestCase(name: string, body: string) {
    return this._templateCollection.TEST_CASE_TEMPLATE({ name, body });
  }

  getLocatorHelper(namespaceName: string): string {
    return this._templateCollection.LOCATOR_HELPER_TEMPLATE({ namespaceName });
  }

  getCustomMatcher(namespaceName: string): string {
    return this._templateCollection.CUSTOM_MATCHER_FILE_TEMPLATE({ namespaceName });
  }

  getPageDefinitions(pageImports: string, pageDeclarations: string, pageAssignments: string) {
    return this._templateCollection.PAGE_DEFINITIONS_TEMPLATE({ pageImports, pageDeclarations, pageAssignments });
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
    return this._templateCollection.PAGE_TEMPLATE({ pageName, pageDescription, pageBody });
  }

  GetComment(message: string) {
    return this._templateCollection.COMMENT({ message, indent: this._indentString });
  }
}
