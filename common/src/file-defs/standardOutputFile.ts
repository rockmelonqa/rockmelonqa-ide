export class StandardOutputFile {
  // dotnet
  static readonly EnvironmentSettings: string = "EnvironmentSettings";
  static readonly RunSettings: string = ".runsettings";
  static readonly Usings: string = "Usings";
  static readonly PageDefinitions: string = "PageDefinitions";
  static readonly LocatorHelper: string = "LocatorHelper";
  static readonly TestCaseBase: string = "TestCaseBase";
  static readonly TestSuiteBase: string = "TestSuiteBase";
  static readonly MetaData: string = ".code-metadata";

  // Nodejs
  static readonly NodePackage: string = "package.json";
  static readonly TsConfig: string = "tsconfig.json";
  static readonly PrettierConfig: string = ".prettierrc";
  static readonly PlaywrightConfig: string = "playwright.config.ts";
  static readonly JestConfig: string = "jest.config.js";
  static readonly CustomMatcher: string = "customMatcher.ts";
}
