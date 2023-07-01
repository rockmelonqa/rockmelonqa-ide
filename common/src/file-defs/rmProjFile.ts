import { IFileDef } from "./fileDef";

/** The Supported automation frameworks: Playwright, Selenium, etc...  */
export enum AutomationFramework {
  Playwright = "Playwright",
  Selenium = "Selenium",
}

/** The supported languages: C#, Java, Typescript,... */
export enum Language {
  CSharp = "C#",
  Java = "Java",
  Python = "Python",
  Typescript = "Typescript",
}

/** The supported test framework: MsTest, NUnit,... */
export enum TestFramework {
  JUnit = "JUnit",
  MSTest = "MSTest",
  NUnit = "NUnit",
  xUnit = "xUnit",
}

/** The supported browser: Chrome, FireFox,... */
export enum Browser {
  Chromium = "chromium",
  Firefox = "firefox",
  Webkit = "webkit",
}

/** Indentation of generated source code */
export enum Indent {
  Spaces = "Spaces",
  Tabs = "Tabs",
}

/** JSON contents of an .rmproj file */
export interface IRmProj {
  fileVersion: number;
  name: string;
  description: string;
  automationFramework: AutomationFramework;
  testFramework: TestFramework | "";
  testIdAttributeName: string;
  language: Language;
  rootNamespace: string;
  indent: Indent;
  indentSize: number;
}

/** .rmproj file info and its contents */
export interface IRmProjFile extends Pick<IFileDef, Exclude<keyof IFileDef, "isValid">> {
  content: IRmProj;
}
