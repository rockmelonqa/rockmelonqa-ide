import { compile } from "handlebars";
import { loadTemplate } from "../utils/templateLoader";
import { BaseTemplateCollection } from "../codegen-common/baseTemplateCollection";
import { TemplateCollectionOptions } from "../playwright-csharp-mstest/templateCollection";

/** Templates collection for PlaywrightTypescriptJest codegen*/
export class JestTemplateCollection extends BaseTemplateCollection {
  public COMMENT: HandlebarsTemplateDelegate<any>;
  public ENVIRONMENT_SETTINGS: HandlebarsTemplateDelegate<any>;
  public EXTEND_PLAYWRIGHT_FILE: HandlebarsTemplateDelegate<any>;
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
  public TEST_ROUTINE_CLASS: HandlebarsTemplateDelegate<any>;
  public TEST_ROUTINE_FILE: HandlebarsTemplateDelegate<any>;
  public TEST_ROUTINE_BASE_FILE: HandlebarsTemplateDelegate<any>;
  public TEST_SUITE_FILE: HandlebarsTemplateDelegate<any>;
  public TS_CONFIG_FILE: HandlebarsTemplateDelegate<any>;

  constructor(templateCollectionOptions: TemplateCollectionOptions) {
    super(templateCollectionOptions);

    this.COMMENT = this.loadAndCompile("comment");
    this.ENVIRONMENT_SETTINGS = this.loadAndCompile("environment-settings");
    this.EXTEND_PLAYWRIGHT_FILE = this.loadAndCompile("extend-playwright");
    this.LOCATOR = this.loadAndCompile("locator");
    this.NODE_PACKAGE_FILE = this.loadAndCompile("node-package");
    this.PAGE_BASE_FILE = this.loadAndCompile("page-base-file");
    this.PAGE_DEFINITIONS_FILE = this.loadAndCompile("page-definitions-file");
    this.PAGE_FILE = this.loadAndCompile("page-file");
    this.PAGE_TEST_FILE = this.loadAndCompile("page-test-file");
    this.PLAYWRIGHT_CONFIG_FILE = this.loadAndCompile("playwright-config");
    this.TEST_CASE_BASE_FILE = this.loadAndCompile("test-case-base-file");
    this.TEST_CASE_FILE = this.loadAndCompile("test-case-file");
    this.TEST_FUNCTION = this.loadAndCompile("test-function");
    this.TEST_ROUTINE_BASE_FILE = this.loadAndCompile("test-routine-base");
    this.TEST_ROUTINE_FILE = this.loadAndCompile("test-routine-file");
    this.TEST_ROUTINE_CLASS = this.loadAndCompile("test-routine-class");
    this.TEST_SUITE_FILE = this.loadAndCompile("test-suite-file");
    this.TS_CONFIG_FILE = this.loadAndCompile("ts-config");
  }
}
