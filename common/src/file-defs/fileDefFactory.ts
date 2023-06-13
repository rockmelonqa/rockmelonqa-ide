import { v4 as uuidv4 } from "uuid";
import { IPage } from "./pageFile";
import { AutomationFramework, Indent, IRmProj, Language, TestFramework } from "./rmProjFile";
import { ITestCase } from "./testCaseFile";
import { ITestRoutine } from "./testRoutineFile";
import { ITestSuite } from "./testSuiteFile";
import { IUserSettings } from "./userSettingsFile";
import { IEnvPage } from "./envFile";

/** Factory to create new instances of our files */
export const fileDefFactory = {
  newUserSetting: (): IUserSettings => {
    return {
      recentFiles: [],
    };
  },

  newRmProj: (): IRmProj => {
    return {
      fileVersion: 0,
      name: "",
      description: "",
      automationFramework: AutomationFramework.Playwright,
      testFramework: TestFramework.MSTest,
      language: Language.CSharp,
      rootNamespace: "",
      indent: Indent.Spaces,
      indentSize: 4,
      testIdAttributeName: "",
    };
  },

  newPageDefinition: (): IPage => {
    return { id: uuidv4(), description: "", elements: [] };
  },

  newTestCase: (): ITestCase => {
    return {
      id: uuidv4(),
      description: "",
      steps: [],
    };
  },

  newTestRoutine: (): ITestRoutine => {
    return {
      id: uuidv4(),
      description: "",
      steps: [],
      dataSets: [],
    };
  },

  newTestSuite: (): ITestSuite => {
    return { id: uuidv4(), description: "", testcases: [] };
  },

  newEnvSettings: (): IEnvPage => {
    return {settings: []}
  }
};
