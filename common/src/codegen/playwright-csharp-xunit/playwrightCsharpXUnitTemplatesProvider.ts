import path from "path";
import { IActionTemplateParam, ILocatorTemplateParam } from "../types";
import { upperCaseFirstChar } from "../utils/stringUtils";
import { XUnitTemplateCollection } from "./templateCollection";
import { IDataSetInfo } from "../playwright-charp-common/dataSetInfo";
import { actionRegistyDotnet } from "../playwright-charp-common/action-registry-dotnet";
import { locatorRegistyDotnet } from "../playwright-charp-common/locator-registry-dotnet";
import { IPlaywrightCsharpTemplatesProvider } from "../playwright-charp-common/playwrightCsharpTemplatesProvider";
import { Indent } from "../../file-defs";

export class PlaywrightCsharpXUnitTemplatesProvider {
  private _templateCollection: XUnitTemplateCollection;

  constructor(customTemplatesDir: string, requiredIndenChar: Indent, requiredIndexSize: number) {
    this._templateCollection = new XUnitTemplateCollection({
      templatesDir: path.resolve(__dirname, "./templates"),
      customTemplatesDir,
      fileExtension: ".hbs",
      requiredIndentChar: requiredIndenChar,
      requiredIndentSize: requiredIndexSize,
      sourceIndentChar: Indent.Spaces,
      sourceIndentSize: 4,
    });
  }

  getTestSuiteBase(rootNamespace: string, testIdAttributeName: string): string {
    return this._templateCollection.TEST_SUITE_BASE_FILE({ rootNamespace, testIdAttributeName });
  }

  getTestSuiteFile(
    usings: string,
    name: string,
    description: string,
    body: string,
    rootNamespace: string,
    fullNamespace: string
  ) {
    return this._templateCollection.TEST_SUITE_FILE({ usings, name, description, body, rootNamespace, fullNamespace });
  }

  getAction(params: IActionTemplateParam) {
    const actionGenerate = actionRegistyDotnet.get(params.action);
    if (!actionGenerate) {
      throw new Error("(DEV) Action is not support: " + params.action);
    }

    return actionGenerate(params);
  }
  getBaseClasses(rootNamespace: string, testIdAttributeName: string): string {
    return this._templateCollection.BASE_CLASSES_FILE({ rootNamespace, testIdAttributeName });
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

  getBasePageFile(rootNamespace: string): string {
    return this._templateCollection.BASE_PAGE_FILE({ rootNamespace });
  }
  getBasePageTestFile(rootNamespace: string): string {
    return this._templateCollection.BASE_PAGE_FILE({ rootNamespace });
  }

  getComment(message: string) {
    return this._templateCollection.COMMENT({ message });
  }

  getTestFunction(name: string, description: string) {
    return this._templateCollection.TEST_FUNCTION({ name, description });
  }
}
