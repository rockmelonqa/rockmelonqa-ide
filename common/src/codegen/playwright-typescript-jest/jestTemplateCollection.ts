import { compile } from "handlebars";
import { loadTemplate } from "../utils/templateLoader";

/** Templates collection for PlaywrightTypescriptJest codegen*/
export class JestTemplateCollection {
  public NODE_PACKAGE_FILE_TEMPLATE: HandlebarsTemplateDelegate<any>;
  public TS_CONFIG_FILE_TEMPLATE: HandlebarsTemplateDelegate<any>;
  public PLAYWRIGHT_CONFIG_FILE_TEMPLATE: HandlebarsTemplateDelegate<any>;
  public JEST_CONFIG_FILE_TEMPLATE: HandlebarsTemplateDelegate<any>;
  public PRETTIER_CONFIG_FILE_TEMPLATE: HandlebarsTemplateDelegate<any>;

  public PAGE_DEFINITIONS_TEMPLATE: HandlebarsTemplateDelegate<any>;
  public LOCATOR_HELPER_TEMPLATE: HandlebarsTemplateDelegate<any>;
  public CUSTOM_MATCHER_FILE_TEMPLATE: HandlebarsTemplateDelegate<any>;

  public PAGE_TEMPLATE: HandlebarsTemplateDelegate<any>;
  public LOCATOR_TEMPLATE: HandlebarsTemplateDelegate<any>;

  public TEST_CASE_TEMPLATE: HandlebarsTemplateDelegate<any>;
  public TEST_FILE_TEMPLATE: HandlebarsTemplateDelegate<any>;

  public COMMENT: HandlebarsTemplateDelegate<any>;

  constructor(templatesDir: string, customTemplatesDir: string, fileExtension: string) {
    const loadAndCompile = (templateFileName: string) =>
      compile(loadTemplate(templatesDir, customTemplatesDir, templateFileName + fileExtension));

    this.NODE_PACKAGE_FILE_TEMPLATE = loadAndCompile("NodePackage");
    this.TS_CONFIG_FILE_TEMPLATE = loadAndCompile("TsConfig");
    this.PLAYWRIGHT_CONFIG_FILE_TEMPLATE = loadAndCompile("PlaywrightConfig");
    this.JEST_CONFIG_FILE_TEMPLATE = loadAndCompile("JestConfig");
    this.PRETTIER_CONFIG_FILE_TEMPLATE = loadAndCompile("PrettierConfig");

    this.PAGE_DEFINITIONS_TEMPLATE = loadAndCompile("PageDefinitions");
    this.LOCATOR_HELPER_TEMPLATE = loadAndCompile("LocatorHelper");
    this.CUSTOM_MATCHER_FILE_TEMPLATE = loadAndCompile("CustomMatcher");

    this.PAGE_TEMPLATE = loadAndCompile("Page");
    this.LOCATOR_TEMPLATE = loadAndCompile("Locator");

    this.TEST_CASE_TEMPLATE = loadAndCompile("TestFunction");
    this.TEST_FILE_TEMPLATE = loadAndCompile("TestFile");

    this.COMMENT = loadAndCompile("Comment");
  }
}
