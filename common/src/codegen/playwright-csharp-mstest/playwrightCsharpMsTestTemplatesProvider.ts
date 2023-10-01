import path from "path";
import { MsTestTemplateCollection } from "./templateCollection";
import { Indent } from "../../file-defs";

export class PlaywrightCsharpMsTestTemplatesProvider {
  private _templateCollection: MsTestTemplateCollection;

  constructor(customTemplatesDir: string, requiredIndenChar: Indent, requiredIndexSize: number) {
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

  getCsProject(rootNamespace: string) {
    return this._templateCollection.CSPROJECT_FILE({ rootNamespace });
  }
  getUsings(rootNamespace: string, hasRoutines: boolean) {
    return this._templateCollection.USINGS_FILE({ rootNamespace, hasRoutines });
  }
  getRunSettings() {
    return this._templateCollection.RUNSETTINGS_FILE({});
  }

  getTestFunction(name: string, description: string) {
    return this._templateCollection.TEST_FUNCTION({ name, description });
  }
}
