import { compile } from "handlebars";
import { loadTemplate } from "../utils/templateLoader";
import { ICsharpTemplateCollection } from "../playwright-charp-common/csharpTemplateCollection";
import { BaseDotnetTemplateCollection } from "../playwright-charp-common/dotnetTemplateCollection";
import { Indent } from "../../file-defs";
import { EOL } from "os";
import { indentCharMap } from "../../file-defs/shared";

export type TemplateCollectionOptions = {
  templatesDir: string;
  customTemplatesDir: string;
  fileExtension: string;
  requiredIndentChar: Indent;
  requiredIndentSize: number;
  sourceIndentChar: Indent;
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
  public readonly LOCATOR_HELPER_FILE: HandlebarsTemplateDelegate<any>;
  public readonly RUNSETTINGS_FILE: HandlebarsTemplateDelegate<any>;
  public readonly USINGS_FILE: HandlebarsTemplateDelegate<any>;

  private readonly templateLoader: TemplateLoader;
  private readonly templateCompiler: TemplateCompiler;
  private readonly templateReindenter: TemplateReindenter;

  constructor(templateCollectionOptions: TemplateCollectionOptions) {
    const {
      templatesDir,
      customTemplatesDir,
      fileExtension,
      requiredIndentChar,
      requiredIndentSize,
      sourceIndentChar,
      sourceIndentSize,
    } = templateCollectionOptions;

    super(templatesDir, customTemplatesDir, fileExtension);

    this.templateLoader = new TemplateLoader(templatesDir, customTemplatesDir, fileExtension);
    this.templateCompiler = new TemplateCompiler();
    this.templateReindenter = new TemplateReindenter(
      sourceIndentChar,
      sourceIndentSize,
      requiredIndentChar,
      requiredIndentSize
    );

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
    this.LOCATOR_HELPER_FILE = this.loadAndCompile("LocatorHelperFile");
    this.CSPROJECT_FILE = this.loadAndCompile("CsProjectFile");
    this.RUNSETTINGS_FILE = this.loadAndCompile("RunSettingsFile");
    this.USINGS_FILE = this.loadAndCompile("UsingsFile");
  }

  private loadAndCompile(templateFileName: string) {
    const raw = this.templateLoader.load(templateFileName);
    const reindented = this.templateReindenter.reindentContent(raw);
    return this.templateCompiler.compile(reindented);
  }
}

export class TemplateReindenter {
  private readonly sourceIndentChar: Indent;
  private readonly sourceIndentSize: number;
  private readonly requiredIndenChar: Indent;
  private readonly requiredIndentSize: number;

  constructor(
    sourceIndentChar: Indent,
    sourceIndentSize: number,
    requiredIndenChar: Indent,
    requiredIndentSize: number
  ) {
    this.sourceIndentChar = sourceIndentChar;
    this.sourceIndentSize = sourceIndentSize;
    this.requiredIndenChar = requiredIndenChar;
    this.requiredIndentSize = requiredIndentSize;
  }

  public reindentContent(rawStr: string): string {
    const lines = rawStr.split(/\r?\n/);
    const indentedLines = lines.map((l) => this.reindentLine(l));
    const indented = indentedLines.join(EOL);
    return indented;
  }

  private reindentLine(line: string): string {
    const leadingIndentCharCount = this.countLeadingIndentChars(line);
    const indentCount = Math.round(leadingIndentCharCount / this.sourceIndentSize);
    const requiredIndent = indentCharMap.get(this.requiredIndenChar)!.repeat(this.requiredIndentSize * indentCount);
    const trimmedStr = this.sourceIndentChar === Indent.Spaces ? line.trim() : line.replace(/^\t+/, "");
    return `${requiredIndent}${trimmedStr}`;
  }

  private countLeadingIndentChars(str: string): number {
    const regex = this.sourceIndentChar === Indent.Spaces ? /^\s+/ : /^\t+/;
    var match = str.match(regex);
    var count = match ? match[0].length : 0;
    return count;
  }
}

class TemplateLoader {
  private templatesDir: string;
  private customTemplatesDir: string;
  private fileExtension: string;

  constructor(templatesDir: string, customTemplatesDir: string, fileExtension: string) {
    this.templatesDir = templatesDir;
    this.customTemplatesDir = customTemplatesDir;
    this.fileExtension = fileExtension;
  }

  load(templateFileName: string) {
    return loadTemplate(this.templatesDir, this.customTemplatesDir, templateFileName + this.fileExtension);
  }
}

class TemplateCompiler {
  constructor() {}

  compile(rawTemplateStr: string): HandlebarsTemplateDelegate<any> {
    return compile(rawTemplateStr);
  }
}
