import path from "path";
import { XUnitTemplateCollection } from "./templateCollection";
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

  getCsProject(rootNamespace: string) {
    return this._templateCollection.CSPROJECT_FILE({ rootNamespace });
  }

  getPageTestFile(rootNamespace: string) {
    return this._templateCollection.PAGE_TEST_FILE({ rootNamespace });
  }

  getPlaywrightLaunchOptionsSettingFile(rootNamespace: string) {
    return this._templateCollection.PLAYWRIGHT_LAUNCH_OPTIONS_SETTING_FILE({ rootNamespace });
  }

  getPlaywrightSettingFile(rootNamespace: string) {
    return this._templateCollection.PLAYWRIGHT_SETTING_FILE({ rootNamespace });
  }

  getRunSettingClassFile(rootNamespace: string) {
    return this._templateCollection.RUN_SETTINGS_CLASS_FILE({ rootNamespace });
  }

  getRunSettingXmlFile() {
    return this._templateCollection.RUN_SETTINGS_XML_FILE({});
  }

  getTestFunction(name: string, description: string) {
    return this._templateCollection.TEST_FUNCTION({ name, description });
  }

  getTestSuiteBase(rootNamespace: string, testIdAttributeName: string): string {
    return this._templateCollection.TEST_SUITE_BASE_FILE({ rootNamespace, testIdAttributeName });
  }

  getUsings(rootNamespace: string, hasRoutines: boolean) {
    return this._templateCollection.USINGS_FILE({ rootNamespace, hasRoutines });
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
}
