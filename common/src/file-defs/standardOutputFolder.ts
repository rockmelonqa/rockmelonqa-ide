import { camelCaseToDash } from "../codegen/utils/stringUtils";

export class StandardOutputFolder {
  /** "Config" */
  static readonly Config: string = "Config";
  /** ".env" */
  static readonly DotEnvironment: string = ".env";
  /** "Pages" */
  static readonly Pages: string = "Pages";
  /** "Tests" */
  static readonly Tests: string = "Tests";
  /** "TestCases" */
  static readonly TestCases: string = "TestCases";
  /** "TestSuites" */
  static readonly TestSuites: string = "TestSuites";
  /** "TestRoutines" */
  static readonly TestRoutines: string = "TestRoutines";
  /** "Support" */
  static readonly Support: string = "Support";
  static readonly MsTestSupport: string = "MsTestSupport";
  static readonly NUnitSupport: string = "NUnitSupport";
  static readonly XUnitSupport: string = "XUnitSupport";
}

export class StandardOutputFolderTypeScript {
  /** "Config" */
  static readonly Config: string = camelCaseToDash(StandardOutputFolder.Config);
  /** ".env" */
  static readonly DotEnvironment: string = camelCaseToDash(StandardOutputFolder.DotEnvironment);
  /** "Pages" */
  static readonly Pages: string = camelCaseToDash(StandardOutputFolder.Pages);
  /** "Tests" */
  static readonly Tests: string = camelCaseToDash(StandardOutputFolder.Tests);
  /** "TestCases" */
  static readonly TestCases: string = camelCaseToDash(StandardOutputFolder.TestCases);
  /** "TestSuites" */
  static readonly TestSuites: string = camelCaseToDash(StandardOutputFolder.TestSuites);
  /** "TestRoutines" */
  static readonly TestRoutines: string = camelCaseToDash(StandardOutputFolder.TestRoutines);
  /** "Support" */
  static readonly Support: string = camelCaseToDash(StandardOutputFolder.Support);
  static readonly PlaywrightReport: string = "playwright-report";
}
