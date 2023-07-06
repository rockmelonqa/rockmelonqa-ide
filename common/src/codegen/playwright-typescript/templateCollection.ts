import { compile } from "handlebars";
import { loadTemplate } from "../utils/templateLoader";

/** Templates collection for PlaywrightTypescriptJest codegen*/
export class JestTemplateCollection {
  public COMMENT: HandlebarsTemplateDelegate<any>;
  public ENVIRONMENT_SETTINGS: HandlebarsTemplateDelegate<any>;
  public LOCATOR: HandlebarsTemplateDelegate<any>;
  public NODE_PACKAGE_FILE: HandlebarsTemplateDelegate<any>;
  public PAGE_BASE_FILE: HandlebarsTemplateDelegate<any>;
  public PAGE_DEFINITIONS_FILE: HandlebarsTemplateDelegate<any>;
  public PAGE_FILE: HandlebarsTemplateDelegate<any>;
  public PAGE_TEST_FILE: HandlebarsTemplateDelegate<any>;
  public PLAYWRIGHT_CONFIG_FILE: HandlebarsTemplateDelegate<any>;
  public TEST_CASE_BASE_FILE: HandlebarsTemplateDelegate<any>;
  public TEST_CASE_FILE: HandlebarsTemplateDelegate<any>;
  public TEST_FUNCTION: HandlebarsTemplateDelegate<any>;
  public TEST_SUITE_FILE: HandlebarsTemplateDelegate<any>;
  public TS_CONFIG_FILE: HandlebarsTemplateDelegate<any>;

  constructor(templatesDir: string, customTemplatesDir: string, fileExtension: string) {
    const loadAndCompile = (templateFileName: string) =>
      compile(loadTemplate(templatesDir, customTemplatesDir, templateFileName + fileExtension));

    this.COMMENT = loadAndCompile("comment");
    this.ENVIRONMENT_SETTINGS = loadAndCompile("environment-settings");
    this.LOCATOR = loadAndCompile("locator");
    this.NODE_PACKAGE_FILE = loadAndCompile("node-package");
    this.PAGE_BASE_FILE = loadAndCompile("page-base-file");
    this.PAGE_DEFINITIONS_FILE = loadAndCompile("page-definitions-file");
    this.PAGE_FILE = loadAndCompile("page-file");
    this.PAGE_TEST_FILE = loadAndCompile("page-test-file");
    this.PLAYWRIGHT_CONFIG_FILE = loadAndCompile("playwright-config");
    this.TEST_CASE_BASE_FILE = loadAndCompile("test-case-base-file");
    this.TEST_CASE_FILE = loadAndCompile("test-case-file");
    this.TEST_FUNCTION = loadAndCompile("test-function");
    this.TEST_SUITE_FILE = loadAndCompile("test-suite-file");
    this.TS_CONFIG_FILE = loadAndCompile("ts-config");
  }
}
