import { BaseTemplateCollection } from "../codegen-common/baseTemplateCollection";
import { TemplateCollectionOptions } from "../playwright-charp-common/commonCsharpTemplateCollection";

/** Templates collection for Playwright Csharp Nunit codegen*/
export class XUnitTemplateCollection extends BaseTemplateCollection {
  public readonly PAGE_TEST_FILE: HandlebarsTemplateDelegate<any>;
  public readonly PLAYWRIGHT_LAUNCH_OPTIONS_SETTING_FILE: HandlebarsTemplateDelegate<any>;
  public readonly PLAYWRIGHT_SETTING_FILE: HandlebarsTemplateDelegate<any>;
  public readonly RUN_SETTINGS_CLASS_FILE: HandlebarsTemplateDelegate<any>;
  public readonly TEST_SUITE_BASE_FILE: HandlebarsTemplateDelegate<any>;
  public readonly RUN_SETTINGS_XML_FILE: HandlebarsTemplateDelegate<any>;

  public readonly CSPROJECT_FILE: HandlebarsTemplateDelegate<any>;
  public readonly USINGS_FILE: HandlebarsTemplateDelegate<any>;
  public readonly TEST_FUNCTION: HandlebarsTemplateDelegate<any>;
  public readonly TEST_SUITE_FILE: HandlebarsTemplateDelegate<any>;

  constructor(templateCollectionOptions: TemplateCollectionOptions) {
    super(templateCollectionOptions);

    this.PAGE_TEST_FILE = this.loadAndCompile("PageTestFile");
    this.PLAYWRIGHT_LAUNCH_OPTIONS_SETTING_FILE = this.loadAndCompile("PlaywrightLaunchOptionsSettingFile");
    this.PLAYWRIGHT_SETTING_FILE = this.loadAndCompile("PlaywrightSettingFile");
    this.RUN_SETTINGS_CLASS_FILE = this.loadAndCompile("RunSettingsClassFile");

    this.TEST_SUITE_BASE_FILE = this.loadAndCompile("TestSuiteBaseFile");
    this.RUN_SETTINGS_XML_FILE = this.loadAndCompile("RunSettingsXmlFile");

    this.CSPROJECT_FILE = this.loadAndCompile("CsProjectFile");
    this.USINGS_FILE = this.loadAndCompile("UsingsFile");
    this.TEST_FUNCTION = this.loadAndCompile("TestFunction");
    this.TEST_SUITE_FILE = this.loadAndCompile("TestSuiteFile");
  }
}
