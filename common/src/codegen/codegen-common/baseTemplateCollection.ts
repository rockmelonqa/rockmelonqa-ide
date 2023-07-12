import { compile } from "handlebars";
import { loadTemplate } from "../utils/templateLoader";
import { ICsharpTemplateCollection } from "../playwright-charp-common/csharpTemplateCollection";
import { Indent } from "../../file-defs";
import { EOL } from "os";
import { indentCharMap } from "../../file-defs/shared";
import { TemplateCollectionOptions } from "../playwright-csharp-mstest/templateCollection";

export class BaseTemplateCollection {
  protected readonly templateLoader: TemplateLoader;
  protected readonly templateCompiler: TemplateCompiler;
  protected readonly templateReindenter: TemplateReindenter;

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

    this.templateLoader = new TemplateLoader(templatesDir, customTemplatesDir, fileExtension);
    this.templateCompiler = new TemplateCompiler();
    this.templateReindenter = new TemplateReindenter(
      sourceIndentChar,
      sourceIndentSize,
      requiredIndentChar,
      requiredIndentSize
    );
  }

  protected loadAndCompile(templateFileName: string) {
    const raw = this.templateLoader.load(templateFileName);
    const reindented = this.templateReindenter.reindentContent(raw);
    return this.templateCompiler.compile(reindented);
  }
}

/** Template Reindenter */
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

  /** Reindents the source string */
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

/** Template loader */
class TemplateLoader {
  private templatesDir: string;
  private customTemplatesDir: string;
  private fileExtension: string;

  constructor(templatesDir: string, customTemplatesDir: string, fileExtension: string) {
    this.templatesDir = templatesDir;
    this.customTemplatesDir = customTemplatesDir;
    this.fileExtension = fileExtension;
  }

  /** Loads the template and returns the content as string */
  load(templateFileName: string): string {
    return loadTemplate(this.templatesDir, this.customTemplatesDir, templateFileName + this.fileExtension);
  }
}

/** Template compiler */
class TemplateCompiler {
  constructor() {}

  /** Compiles the raw string to Handlebars template */
  compile(rawTemplateStr: string): HandlebarsTemplateDelegate<any> {
    return compile(rawTemplateStr);
  }
}
