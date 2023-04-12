import { IFileDef } from "./fileDef";

export enum AutomationFramework {
  Playwright = "Playwright",
  Selenium = "Selenium",
}

export enum Language {
  CSharp = "C#",
  Java = "Java",
  Python = "Python",
  Typescript = "Typescript",
}

export enum TestFramework {
  JUnit = "JUnit",
  MSTest = "MSTest",
  NUnit = "NUnit",
  xUnit = "xUnit",
  /** To be removed */
  Jest = "Jest",
}

export enum Browser {
  Chromium = "chromium",
  Firefox = "firefox",
  Webkit = "webkit",
}

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
  testFramework: TestFramework;
  language: Language;
  rootNamespace: string;
  indent: Indent;
  indentSize: number;
}

/** .rmproj file and its contents */
export interface IRmProjFile extends Pick<IFileDef, Exclude<keyof IFileDef, "isValid">> {
  content: IRmProj;
}
