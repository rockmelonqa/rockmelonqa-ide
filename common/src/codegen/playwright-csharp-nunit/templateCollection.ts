import { compile } from "handlebars";
import { loadTemplate } from "../utils/templateLoader";
import { ICsharpTemplateCollection } from "../playwright-charp-common/csharpTemplateCollection";

/** Templates collection for Playwright Csharp Nunit codegen*/
export class NunitTemplateCollection implements ICsharpTemplateCollection {
  public COMMENT: HandlebarsTemplateDelegate<any>;
  public CSPROJECT_FILE: HandlebarsTemplateDelegate<any>;
  public PAGE_DEFINITIONS_FILE: HandlebarsTemplateDelegate<any>;
  public PAGE_FILE: HandlebarsTemplateDelegate<any>;
  public PAGE_ELEMENT_PROPERTY: HandlebarsTemplateDelegate<any>;
  public TEST_FUNCTION: HandlebarsTemplateDelegate<any>;
  public TEST_SUITE_FILE: HandlebarsTemplateDelegate<any>;
  public LOCATOR_HELPER_FILE: HandlebarsTemplateDelegate<any>;
  public USINGS_FILE: HandlebarsTemplateDelegate<any>;
  public RUNSETTINGS_FILE: HandlebarsTemplateDelegate<any>;
  public TEST_CASE_BASE_FILE: HandlebarsTemplateDelegate<any>;
  public TEST_SUITE_BASE_FILE: HandlebarsTemplateDelegate<any>;
  public TEST_CASE_FILE: HandlebarsTemplateDelegate<any>;
  public TEST_ROUTINE_FILE: HandlebarsTemplateDelegate<any>;
  public BASE_CLASSES_FILE: HandlebarsTemplateDelegate<any>;

  constructor(templatesDir: string, customTemplatesDir: string, fileExtension: string) {
    const loadAndCompile = (templateFileName: string) =>
      compile(loadTemplate(templatesDir, customTemplatesDir, templateFileName + fileExtension));

    this.COMMENT = loadAndCompile("Comment");
    this.CSPROJECT_FILE = loadAndCompile("CsProjectFile");
    this.LOCATOR_HELPER_FILE = loadAndCompile("LocatorHelperFile");
    this.PAGE_FILE = loadAndCompile("PageFile");
    this.PAGE_DEFINITIONS_FILE = loadAndCompile("PageDefinitionsFile");
    this.PAGE_ELEMENT_PROPERTY = loadAndCompile("PageElementProperty");
    this.TEST_FUNCTION = loadAndCompile("TestFunction");
    this.TEST_SUITE_FILE = loadAndCompile("TestSuiteFile");
    this.RUNSETTINGS_FILE = loadAndCompile("RunSettingsFile");
    this.TEST_CASE_BASE_FILE = loadAndCompile("TestCaseBaseFile");
    this.TEST_SUITE_BASE_FILE = loadAndCompile("TestSuiteBaseFile");
    this.TEST_CASE_FILE = loadAndCompile("TestCaseFile");
    this.TEST_ROUTINE_FILE = loadAndCompile("TestRoutineFile");
    this.USINGS_FILE = loadAndCompile("UsingsFile");
    this.BASE_CLASSES_FILE = compile("");
  }
}
