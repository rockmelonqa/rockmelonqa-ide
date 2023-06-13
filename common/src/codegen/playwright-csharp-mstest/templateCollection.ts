import { compile } from "handlebars";
import { loadTemplate } from "../utils/templateLoader";
import { ICsharpTemplateCollection } from "../playwright-charp-common/csharpTemplateCollection";
import { BaseDotnetTemplateCollection } from "../playwright-charp-common/dotnetTemplateCollection";

/** Templates collection for Playwright Csharp MsTest codegen */
export class MsTestTemplateCollection extends BaseDotnetTemplateCollection implements ICsharpTemplateCollection {
  public readonly BASE_CLASSES_FILE: HandlebarsTemplateDelegate<any>;
  public readonly COMMENT: HandlebarsTemplateDelegate<any>;

  public readonly PAGE_DEFINITIONS_FILE: HandlebarsTemplateDelegate<any>;
  public readonly PAGE_ELEMENT_PROPERTY: HandlebarsTemplateDelegate<any>;
  public readonly PAGE_FILE: HandlebarsTemplateDelegate<any>;

  public readonly TEST_CASE_BASE_FILE: HandlebarsTemplateDelegate<any>;
  public readonly TEST_CASE_FILE: HandlebarsTemplateDelegate<any>;
  public readonly TEST_ROUTINE_CLASS: HandlebarsTemplateDelegate<any>;
  public readonly TEST_ROUTINE_FILE: HandlebarsTemplateDelegate<any>;
  public readonly TEST_SUITE_BASE_FILE: HandlebarsTemplateDelegate<any>;
  public readonly TEST_SUITE_FILE: HandlebarsTemplateDelegate<any>;

  public readonly TEST_FUNCTION: HandlebarsTemplateDelegate<any>;
  public readonly CSPROJECT_FILE: HandlebarsTemplateDelegate<any>;
  public readonly LOCATOR_HELPER_FILE: HandlebarsTemplateDelegate<any>;
  public readonly RUNSETTINGS_FILE: HandlebarsTemplateDelegate<any>;
  public readonly USINGS_FILE: HandlebarsTemplateDelegate<any>;

  constructor(templatesDir: string, customTemplatesDir: string, fileExtension: string) {
    super(templatesDir, customTemplatesDir, fileExtension);
    const loadAndCompile = (templateFileName: string) =>
      compile(loadTemplate(templatesDir, customTemplatesDir, templateFileName + fileExtension));

    this.BASE_CLASSES_FILE = compile("");
    this.COMMENT = loadAndCompile("Comment");

    this.PAGE_DEFINITIONS_FILE = loadAndCompile("PageDefinitionsFile");
    this.PAGE_ELEMENT_PROPERTY = loadAndCompile("PageElementProperty");
    this.PAGE_FILE = loadAndCompile("PageFile");

    this.TEST_CASE_BASE_FILE = loadAndCompile("TestCaseBaseFile");
    this.TEST_CASE_FILE = loadAndCompile("TestCaseFile");
    this.TEST_ROUTINE_CLASS = loadAndCompile("TestRoutineClass");
    this.TEST_ROUTINE_FILE = loadAndCompile("TestRoutineFile");
    this.TEST_SUITE_BASE_FILE = loadAndCompile("TestSuiteBaseFile");
    this.TEST_SUITE_FILE = loadAndCompile("TestSuiteFile");

    this.TEST_FUNCTION = loadAndCompile("TestFunction");
    this.LOCATOR_HELPER_FILE = loadAndCompile("LocatorHelperFile");
    this.CSPROJECT_FILE = loadAndCompile("CsProjectFile");
    this.RUNSETTINGS_FILE = loadAndCompile("RunSettingsFile");
    this.USINGS_FILE = loadAndCompile("UsingsFile");
  }
}
