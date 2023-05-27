import { compile } from "handlebars";
import { loadTemplate } from "../utils/templateLoader";

/** Templates collection for Playwright Csharp MsTest codegen */
export class MsTestTemplateCollection {
  public readonly COMMENT: HandlebarsTemplateDelegate<any>;
  public readonly CSPROJECT_TEMPLATE: HandlebarsTemplateDelegate<any>;
  public readonly LOCATOR_HELPER_FILE: HandlebarsTemplateDelegate<any>;
  public readonly PAGE_DEFINITIONS_TEMPLATE: HandlebarsTemplateDelegate<any>;
  public readonly PAGE_FILE: HandlebarsTemplateDelegate<any>;
  public readonly PAGE_ELEMENT_PROPERTY: HandlebarsTemplateDelegate<any>;
  public readonly TEST_FUNCTION_TEMPLATE: HandlebarsTemplateDelegate<any>;
  public readonly RUNSETTINGS_FILE: HandlebarsTemplateDelegate<any>;
  public readonly TEST_CASE_FILE: HandlebarsTemplateDelegate<any>;
  public readonly TEST_SUITE_FILE: HandlebarsTemplateDelegate<any>;
  public readonly TEST_SUITE_BASE_FILE: HandlebarsTemplateDelegate<any>;
  public readonly USINGS_TEMPLATE: HandlebarsTemplateDelegate<any>;
  public readonly TEST_CASE_BASE_FILE: HandlebarsTemplateDelegate<any>;
  public readonly TEST_ROUTINE_CLASS: HandlebarsTemplateDelegate<any>;
  public readonly TEST_ROUTINE_FILE: HandlebarsTemplateDelegate<any>;

  constructor(templatesDir: string, customTemplatesDir: string, fileExtension: string) {
    const loadAndCompile = (templateFileName: string) =>
      compile(loadTemplate(templatesDir, customTemplatesDir, templateFileName + fileExtension));

    this.COMMENT = loadAndCompile("Comment");
    this.PAGE_DEFINITIONS_TEMPLATE = loadAndCompile("PageDefinitions");
    this.PAGE_FILE = loadAndCompile("PageFile");
    this.PAGE_ELEMENT_PROPERTY = loadAndCompile("PageElementProperty");
    this.TEST_FUNCTION_TEMPLATE = loadAndCompile("TestFunction");
    this.TEST_CASE_FILE = loadAndCompile("TestCaseFile");
    this.TEST_ROUTINE_CLASS = loadAndCompile("TestRoutineClass");
    this.TEST_ROUTINE_FILE = loadAndCompile("TestRoutineFile");
    this.TEST_SUITE_BASE_FILE = loadAndCompile("TestSuiteBaseFile");
    this.TEST_SUITE_FILE = loadAndCompile("TestSuiteFile");
    this.LOCATOR_HELPER_FILE = loadAndCompile("LocatorHelperFile");
    this.CSPROJECT_TEMPLATE = loadAndCompile("CsProject");
    this.USINGS_TEMPLATE = loadAndCompile("Usings");
    this.RUNSETTINGS_FILE = loadAndCompile("RunSettingsFile");
    this.TEST_CASE_BASE_FILE = loadAndCompile("TestCaseBaseFile");
  }
}
