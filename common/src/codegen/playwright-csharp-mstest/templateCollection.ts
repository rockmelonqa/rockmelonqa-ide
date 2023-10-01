import { compile } from "handlebars";
import { loadTemplate } from "../utils/templateLoader";
import { ICsharpTemplateCollection } from "../playwright-charp-common/csharpTemplateCollection";
import { BaseDotnetTemplateCollection } from "../playwright-charp-common/dotnetTemplateCollection";
import { Indent } from "../../file-defs";
import { EOL } from "os";
import { indentCharMap } from "../../file-defs/shared";
import { BaseTemplateCollection } from "../codegen-common/baseTemplateCollection";
import { TemplateCollectionOptions } from "../playwright-charp-common/commonCsharpTemplateCollection";

/** Templates collection for Playwright Csharp MsTest codegen */
export class MsTestTemplateCollection extends BaseTemplateCollection {
  public readonly TEST_SUITE_BASE_FILE: HandlebarsTemplateDelegate<any>;
  public readonly TEST_SUITE_FILE: HandlebarsTemplateDelegate<any>;

  public readonly CSPROJECT_FILE: HandlebarsTemplateDelegate<any>;
  public readonly RUNSETTINGS_FILE: HandlebarsTemplateDelegate<any>;
  public readonly USINGS_FILE: HandlebarsTemplateDelegate<any>;

  constructor(templateCollectionOptions: TemplateCollectionOptions) {
    super(templateCollectionOptions);

    this.TEST_SUITE_BASE_FILE = this.loadAndCompile("TestSuiteBaseFile");
    this.TEST_SUITE_FILE = this.loadAndCompile("TestSuiteFile");
    this.CSPROJECT_FILE = this.loadAndCompile("CsProjectFile");
    this.RUNSETTINGS_FILE = this.loadAndCompile("RunSettingsFile");
    this.USINGS_FILE = this.loadAndCompile("UsingsFile");
  }
}
