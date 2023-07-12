import { TemplateCollectionOptions } from "../playwright-csharp-mstest/templateCollection";
import { BaseTemplateCollection } from "../codegen-common/baseTemplateCollection";

export class BaseDotnetTemplateCollection extends BaseTemplateCollection {
  public readonly ENVIRONMENT_SETTINGS_FILE: HandlebarsTemplateDelegate<any>;

  constructor(templateCollectionOptions: TemplateCollectionOptions) {
    super(templateCollectionOptions);
    this.ENVIRONMENT_SETTINGS_FILE = this.loadAndCompile("EnvironmentSettings");
  }
}
