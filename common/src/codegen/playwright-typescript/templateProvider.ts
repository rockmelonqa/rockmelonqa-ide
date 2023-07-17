import path from "path";
import { Indent } from "../../file-defs";
import { lowerCaseFirstChar, upperCaseFirstChar } from "../utils/stringUtils";
import { actionRegistyPlaywright } from "./action-registry";
import { JestTemplateCollection } from "./templateCollection";
import { locatorRegisty } from "./locator-registry";
import { IActionTemplateParam, ILocatorTemplateParam } from "../types";
import { indentCharMap } from "../../file-defs/shared";

export class PlaywrightTypescriptTemplateProvider {
  private _templateCollection: JestTemplateCollection;

  private _indentChar: string;
  private _indentString: string;

  constructor(customTemplatesDir: string, requiredIndenChar: Indent, requiredIndexSize: number) {
    this._templateCollection = new JestTemplateCollection({
      templatesDir: path.resolve(__dirname, "./templates"),
      customTemplatesDir,
      fileExtension: ".hbs",
      requiredIndentChar: requiredIndenChar,
      requiredIndentSize: requiredIndexSize,

      sourceIndentChar: Indent.Spaces,
      sourceIndentSize: 2,
    });

    this._indentChar = indentCharMap.get(requiredIndenChar)!;
    this._indentString = this._indentChar.repeat(requiredIndexSize);
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

  getExtendPlaywrightFile() {
    return this._templateCollection.EXTEND_PLAYWRIGHT_FILE({});
  }

  getLocator(params: ILocatorTemplateParam) {
    let { elementName, locatorType, returnedLocatorType, description } = params;

    const generateGetter = locatorRegisty.get(locatorType);

    if (!generateGetter) {
      throw new Error("(DEV) LocatorType is not supported: " + locatorType);
    }
    const getter = generateGetter(params);

    let output = this._templateCollection.LOCATOR({
      hasParams: params.hasParams,
      elementName: lowerCaseFirstChar(elementName),
      getter,
      description,
      returnedLocatorType,
    });

    return output;
  }

  getEnvironmentSettingsFiles(allVariableNames: string[]): string {
    return this._templateCollection.ENVIRONMENT_SETTINGS({ allVariableNames });
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
  getTestRoutineBase() {
    return this._templateCollection.TEST_ROUTINE_BASE_FILE({});
  }
  getNodePackageFile(projectName: string) {
    return this._templateCollection.NODE_PACKAGE_FILE({ projectName });
  }

  getTsConfigFile() {
    return this._templateCollection.TS_CONFIG_FILE({});
  }

  getPlaywrightConfigFile() {
    return this._templateCollection.PLAYWRIGHT_CONFIG_FILE({});
  }

  getTestCaseFile(testCaseName: string, routineImports: string[], description: string, body: string) {
    return this._templateCollection.TEST_CASE_FILE({ testCaseName, routineImports, description, body });
  }
  getTestSuiteFile(imports: string, name: string, description: string, body: string) {
    return this._templateCollection.TEST_SUITE_FILE({ imports, name, description, body });
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

  getPage(pageDescription: string | undefined, pageBody: string) {
    return this._templateCollection.PAGE_FILE({ pageDescription, pageBody });
  }

  getTestFunction(name: string, description: string) {
    return this._templateCollection.TEST_FUNCTION({ name, description });
  }

  getComment(message: string) {
    return this._templateCollection.COMMENT({ message, indent: this._indentString });
  }
  getTestRoutineClass(testRoutineName: string, description: string, body: string) {
    return this._templateCollection.TEST_ROUTINE_CLASS({
      testRoutineName,
      description,
      body,
    });
  }
  getTestRoutineFile(testRoutineClasses: string[]) {
    return this._templateCollection.TEST_ROUTINE_FILE({
      testRoutineClasses,
    });
  }
}
