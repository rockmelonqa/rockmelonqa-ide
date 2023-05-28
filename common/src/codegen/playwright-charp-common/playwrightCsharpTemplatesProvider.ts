import { IActionTemplateParam, ILocatorTemplateParam } from "../types";

export interface IPlaywrightCsharpTemplatesProvider {
  getTestSuiteFile: (
    usings: string,
    name: string,
    description: string,
    body: string,
    rootNamespace: string,
    fullNamespace: string
  ) => string;
  getTestSuiteBase: (rootNamespace: string, testIdAttributeName: string) => string;
  getTestCaseFile: (testCaseName: string, description: string, body: string, rootNamespace: string, fullNamespace: string) => string;
  getTestRoutineClass: (testRoutineName: string, description: string, body: string) => string;
  getTestRoutineFile: (rootNamespace: string, fullNamespace: string, testRoutineClasses: string[]) => string;
  getAction: (params: IActionTemplateParam) => string;
  getLocator: (params: ILocatorTemplateParam) => string;
  getComment: (message: string) => string;
  getTestFunction: (name: string, description: string) => string;
  getCsProject: (rootNamespace: string) => string;
  getUsings: (rootNamespace: string, hasRoutines: boolean) => string;
  getRunSettings: () => string;
  getTestCaseBase: (rootNamespace: string) => string;
  getPageDefinitions: (rootNamespace: string, usings: string, pageDeclaration: string, body: string) => string;
  getLocatorHelper: (rootNamespace: string) => string;
  getPage: (fullNamespace: string, pageClassName: string, pageDescription: string, pageBody: string) => string;
}
