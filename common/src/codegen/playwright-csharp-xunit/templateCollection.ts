import { compile } from "handlebars";
import { loadTemplate } from "../utils/templateLoader";

/** Templates collection for Playwright Csharp Nunit codegen*/
export class XUnitTemplateCollection {
  public PAGE_DEFINITIONS_TEMPLATE: HandlebarsTemplateDelegate<any>;
  public PAGE_TEMPLATE: HandlebarsTemplateDelegate<any>;
  public LOCATOR_TEMPLATE: HandlebarsTemplateDelegate<any>;
  public TEST_FUNCTION_TEMPLATE: HandlebarsTemplateDelegate<any>;
  public TEST_SUITE_FILE: HandlebarsTemplateDelegate<any>;
  public LOCATOR_HELPER_TEMPLATE: HandlebarsTemplateDelegate<any>;
  public CSPROJECT_TEMPLATE: HandlebarsTemplateDelegate<any>;
  public USINGS_TEMPLATE: HandlebarsTemplateDelegate<any>;
  public RUNSETTINGS_TEMPLATE: HandlebarsTemplateDelegate<any>;
  public COMMENT_TEMPLATE: HandlebarsTemplateDelegate<any>;
  public BASE_CLASSES_TEMPLATE: HandlebarsTemplateDelegate<any>;
  public TEST_CASE_FILE_TEMPLATE: HandlebarsTemplateDelegate<any>;

  constructor(templatesDir: string, customTemplatesDir: string, fileExtension: string) {
    const loadAndCompile = (templateFileName: string) =>
      compile(loadTemplate(templatesDir, customTemplatesDir, templateFileName + fileExtension));

    this.PAGE_DEFINITIONS_TEMPLATE = loadAndCompile("PageDefinitions");
    this.PAGE_TEMPLATE = loadAndCompile("Page");
    this.LOCATOR_TEMPLATE = loadAndCompile("Locator");
    this.TEST_FUNCTION_TEMPLATE = loadAndCompile("TestFunction");
    this.TEST_SUITE_FILE = loadAndCompile("TestSuiteFile");
    this.LOCATOR_HELPER_TEMPLATE = loadAndCompile("LocatorHelper");
    this.CSPROJECT_TEMPLATE = loadAndCompile("CsProject");
    this.USINGS_TEMPLATE = loadAndCompile("Usings");
    this.RUNSETTINGS_TEMPLATE = loadAndCompile("RunSettings");
    this.COMMENT_TEMPLATE = loadAndCompile("Comment");
    this.BASE_CLASSES_TEMPLATE = loadAndCompile("BaseClasses");
    this.TEST_CASE_FILE_TEMPLATE = loadAndCompile("TestCaseFile");
  }
}
