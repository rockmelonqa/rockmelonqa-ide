import { AutomationFramework, Indent, Language, TestFramework } from "../../../src/file-defs";
import { RmpSpec } from "../../test-helpers/rm-project-spec.types";
import { createTestDataKitchenSink } from "../playwright-typescript/playwright-typescript-kitchen-sink.test-data";

export const createPlaywrightNunitTestData = (): RmpSpec => {
  const kitchenSinkData = createTestDataKitchenSink();
  return {
    projectName: "google-test-playwright-nunit",
    content: {
      fileVersion: 1,
      name: "",
      description: "",
      automationFramework: AutomationFramework.Playwright,
      testFramework: TestFramework.NUnit,
      language: Language.CSharp,
      rootNamespace: "",
      indent: Indent.Spaces,
      indentSize: 4,
      testIdAttributeName: "",
    },

    configFiles: kitchenSinkData.configFiles,
    pages: kitchenSinkData.pages,
    testcases: kitchenSinkData.testcases,
    testroutines: kitchenSinkData.testroutines,
    testsuites: kitchenSinkData.testsuites,
    outputFiles: [],
  };
};
