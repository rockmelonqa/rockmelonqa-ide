import { compile } from "handlebars";
import { ICsharpTemplateCollection } from "../playwright-charp-common/csharpTemplateCollection";
import { BaseDotnetTemplateCollection } from "../playwright-charp-common/dotnetTemplateCollection";
import { TemplateCollectionOptions } from "../playwright-csharp-mstest/templateCollection";

/** Templates collection for Playwright Csharp Nunit codegen*/
export class NunitTemplateCollection extends BaseDotnetTemplateCollection implements ICsharpTemplateCollection {
  public readonly BASE_CLASSES_FILE: HandlebarsTemplateDelegate<any>;
  public readonly BASE_PAGE_FILE: HandlebarsTemplateDelegate<any>;
  public readonly BASE_PAGE_TEST_FILE: HandlebarsTemplateDelegate<any>;
  public readonly COMMENT: HandlebarsTemplateDelegate<any>;

  public readonly PAGE_DEFINITIONS_FILE: HandlebarsTemplateDelegate<any>;
  public readonly PAGE_ELEMENT_PROPERTY: HandlebarsTemplateDelegate<any>;
  public readonly PAGE_FILE: HandlebarsTemplateDelegate<any>;

  public readonly TEST_CASE_BASE_FILE: HandlebarsTemplateDelegate<any>;
  public readonly TEST_CASE_FILE: HandlebarsTemplateDelegate<any>;
  public readonly TEST_ROUTINE_CLASS: HandlebarsTemplateDelegate<any>;
  public readonly TEST_ROUTINE_FILE: HandlebarsTemplateDelegate<any>;
  public readonly TEST_ROUTINE_BASE_FILE: HandlebarsTemplateDelegate<any>;
  public readonly TEST_SUITE_BASE_FILE: HandlebarsTemplateDelegate<any>;
  public readonly TEST_SUITE_FILE: HandlebarsTemplateDelegate<any>;

  public readonly TEST_FUNCTION: HandlebarsTemplateDelegate<any>;
  public readonly CSPROJECT_FILE: HandlebarsTemplateDelegate<any>;
  public readonly RUNSETTINGS_FILE: HandlebarsTemplateDelegate<any>;
  public readonly USINGS_FILE: HandlebarsTemplateDelegate<any>;

  constructor(templateCollectionOptions: TemplateCollectionOptions) {
    super(templateCollectionOptions);

    this.BASE_CLASSES_FILE = compile("");
    this.BASE_PAGE_FILE = this.loadAndCompile("BasePageFile");
    this.BASE_PAGE_TEST_FILE = this.loadAndCompile("BasePageTestFile");
    this.COMMENT = this.loadAndCompile("Comment");

    this.PAGE_DEFINITIONS_FILE = this.loadAndCompile("PageDefinitionsFile");
    this.PAGE_ELEMENT_PROPERTY = this.loadAndCompile("PageElementProperty");
    this.PAGE_FILE = this.loadAndCompile("PageFile");

    this.TEST_CASE_BASE_FILE = this.loadAndCompile("TestCaseBaseFile");
    this.TEST_CASE_FILE = this.loadAndCompile("TestCaseFile");
    this.TEST_ROUTINE_CLASS = this.loadAndCompile("TestRoutineClass");
    this.TEST_ROUTINE_FILE = this.loadAndCompile("TestRoutineFile");
    this.TEST_ROUTINE_BASE_FILE = this.loadAndCompile("TestRoutineBaseFile");
    this.TEST_SUITE_BASE_FILE = this.loadAndCompile("TestSuiteBaseFile");
    this.TEST_SUITE_FILE = this.loadAndCompile("TestSuiteFile");

    this.TEST_FUNCTION = this.loadAndCompile("TestFunction");
    this.CSPROJECT_FILE = this.loadAndCompile("CsProjectFile");
    this.RUNSETTINGS_FILE = this.loadAndCompile("RunSettingsFile");
    this.USINGS_FILE = this.loadAndCompile("UsingsFile");
  }
}
