import {
  AutomationFramework,
  Indent,
  IRmProj,
  ITestCase,
  ITestSuite,
  Language,
  LocatorType,
  TestFramework,
} from "../../../src/file-defs";
import { RmpSpec } from "../../test-helpers/rm-project-spec.types";
import { commonMsTestOutputFiles } from "../../test-helpers/common-files-dotnet";
import { simpleRoutineTestData } from "../playwright-csharp/simple-routine.test-data";

export const createPlaywrightMsTestTestData = (): RmpSpec => {
  return {
    // Name of the project file, should be unique among tests in `codegen` test
    projectName: "google-test-playwright-mstest",
    // The content of the rmproj file
    content: {
      fileVersion: 1,
      name: "",
      description: "",
      automationFramework: AutomationFramework.Playwright,
      testFramework: TestFramework.MSTest,
      language: Language.CSharp,
      rootNamespace: "",
      indent: Indent.Spaces,
      indentSize: 2,
      testIdAttributeName: "",
    },

    ...simpleRoutineTestData,

    outputFiles: [],
  };
};
