import { compile } from "handlebars";
import { loadTemplate } from "../utils/templateLoader";
import { ICsharpTemplateCollection } from "../playwright-charp-common/csharpTemplateCollection";

/** Templates collection for Playwright Csharp Nunit codegen*/
export class XUnitTemplateCollection implements ICsharpTemplateCollection {
  public PAGE_DEFINITIONS_FILE: HandlebarsTemplateDelegate<any>;
  public PAGE_FILE: HandlebarsTemplateDelegate<any>;
  public PAGE_ELEMENT_PROPERTY: HandlebarsTemplateDelegate<any>;
  public TEST_FUNCTION: HandlebarsTemplateDelegate<any>;
  public TEST_SUITE_FILE: HandlebarsTemplateDelegate<any>;
  public LOCATOR_HELPER_FILE: HandlebarsTemplateDelegate<any>;
  public CSPROJECT_FILE: HandlebarsTemplateDelegate<any>;
  public USINGS_FILE: HandlebarsTemplateDelegate<any>;
  public RUNSETTINGS_FILE: HandlebarsTemplateDelegate<any>;
  public COMMENT: HandlebarsTemplateDelegate<any>;
  public BASE_CLASSES_FILE: HandlebarsTemplateDelegate<any>;
  public TEST_CASE_FILE: HandlebarsTemplateDelegate<any>;
  public TEST_ROUTINE_FILE: HandlebarsTemplateDelegate<any>;

  constructor(templatesDir: string, customTemplatesDir: string, fileExtension: string) {
    const loadAndCompile = (templateFileName: string) =>
      compile(loadTemplate(templatesDir, customTemplatesDir, templateFileName + fileExtension));

    this.PAGE_DEFINITIONS_FILE = loadAndCompile("PageDefinitions");
    this.PAGE_FILE = loadAndCompile("Page");
    this.PAGE_ELEMENT_PROPERTY = loadAndCompile("PageElementProperty");
    this.TEST_FUNCTION = loadAndCompile("TestFunction");
    this.TEST_SUITE_FILE = loadAndCompile("TestSuiteFile");
    this.LOCATOR_HELPER_FILE = loadAndCompile("LocatorHelper");
    this.CSPROJECT_FILE = loadAndCompile("CsProjectFile");
    this.USINGS_FILE = loadAndCompile("UsingsFile");
    this.RUNSETTINGS_FILE = loadAndCompile("RunSettingsFile");
    this.COMMENT = loadAndCompile("Comment");
    this.BASE_CLASSES_FILE = loadAndCompile("BaseClassesFile");
    this.TEST_CASE_FILE = loadAndCompile("TestCaseFile");
    this.TEST_ROUTINE_FILE = loadAndCompile("TestRoutineFile");
  }
}
