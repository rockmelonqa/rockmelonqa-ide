import { compile } from "handlebars";
import { loadTemplate } from "../utils/templateLoader";
import { ICsharpTemplateCollection } from "../playwright-charp-common/csharpTemplateCollection";
import { BaseDotnetTemplateCollection } from "../playwright-charp-common/dotnetTemplateCollection";
import { Indent } from "../../file-defs";
import { EOL } from "os";
import { indentCharMap } from "../../file-defs/shared";

/** Wrapper for the parameters needed for initializing a TemplateCollection.  */
export type TemplateCollectionOptions = {
  /** The default templates directory of the IDE. e.g For MsTest, it's `src\codegen\playwright-csharp-mstest\templates`*/
  templatesDir: string;
  /** The custom template directory of current RM prroject. This should be `custom-code/templates` */
  customTemplatesDir: string;
  /** The file extension of the template files. Currently it's `.hbs` */
  fileExtension: string;
  /** The Indent char that is specified in the .rmproj file */
  requiredIndentChar: Indent;
  /** The Indent size that is specified in the .rmproj file */
  requiredIndentSize: number;
  /** The Indent char that is applied in the source .hbs file */
  sourceIndentChar: Indent;
  /** The Indent size that is applied in the source .hbs file */
  sourceIndentSize: number;
};

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
  public readonly RUNSETTINGS_FILE: HandlebarsTemplateDelegate<any>;
  public readonly USINGS_FILE: HandlebarsTemplateDelegate<any>;

  constructor(templateCollectionOptions: TemplateCollectionOptions) {
    super(templateCollectionOptions);

    this.BASE_CLASSES_FILE = compile("");
    this.COMMENT = this.loadAndCompile("Comment");

    this.PAGE_DEFINITIONS_FILE = this.loadAndCompile("PageDefinitionsFile");
    this.PAGE_ELEMENT_PROPERTY = this.loadAndCompile("PageElementProperty");
    this.PAGE_FILE = this.loadAndCompile("PageFile");

    this.TEST_CASE_BASE_FILE = this.loadAndCompile("TestCaseBaseFile");
    this.TEST_CASE_FILE = this.loadAndCompile("TestCaseFile");
    this.TEST_ROUTINE_CLASS = this.loadAndCompile("TestRoutineClass");
    this.TEST_ROUTINE_FILE = this.loadAndCompile("TestRoutineFile");
    this.TEST_SUITE_BASE_FILE = this.loadAndCompile("TestSuiteBaseFile");
    this.TEST_SUITE_FILE = this.loadAndCompile("TestSuiteFile");

    this.TEST_FUNCTION = this.loadAndCompile("TestFunction");
    this.CSPROJECT_FILE = this.loadAndCompile("CsProjectFile");
    this.RUNSETTINGS_FILE = this.loadAndCompile("RunSettingsFile");
    this.USINGS_FILE = this.loadAndCompile("UsingsFile");
  }
}
