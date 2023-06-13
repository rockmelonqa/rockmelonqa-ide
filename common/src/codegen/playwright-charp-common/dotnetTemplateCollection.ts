import { compile } from "handlebars";
import { loadTemplate } from "../utils/templateLoader";

export class BaseDotnetTemplateCollection {
  public readonly ENVIRONMENT_SETTINGS_FILE: HandlebarsTemplateDelegate<any>;

  constructor(templatesDir: string, customTemplatesDir: string, fileExtension: string) {
    const loadAndCompile = (templateFileName: string) =>
      compile(loadTemplate(templatesDir, customTemplatesDir, templateFileName + fileExtension));
    this.ENVIRONMENT_SETTINGS_FILE = loadAndCompile("EnvironmentSettings");
  }
}
