import fs from "fs";
import path from "path";

import { AutomationFramework, Indent, Language, TestFramework } from "../../../src/file-defs";

import { IProgressEvent } from "../../../src/ipc-defs";
import { generateCode } from "../../../src/codegen";
import { writeOutputProjectFiles, createRmTestProject } from "../../test-helpers/rm-project-generator";
import { createTempDir } from "../../test-helpers/fsHelpers";
import { createTestDataKitchenSink } from "../playwright-csharp-common/playwright-common.test-data";
import { RmpSpec } from "../../test-helpers/rm-project-spec.types";

export const createPlaywrightXUnitTestData = (): RmpSpec => {
  const kitchenSinkData = createTestDataKitchenSink();
  return {
    projectName: "playwright-csharp-xunit",
    content: {
      fileVersion: 1,
      name: "",
      description: "",
      automationFramework: AutomationFramework.Playwright,
      testFramework: TestFramework.xUnit,
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

test("CodeGen Playwright CSharp xUnit", async () => {
  // Arrange
  const tmpDir = createTempDir("playwright-csharp-xunit");
  const projSpec = createPlaywrightXUnitTestData();
  const copyToDir = path.join(tmpDir, "rmproj");
  fs.mkdirSync(copyToDir);
  const projFile = createRmTestProject(projSpec, copyToDir);

  const sampleOutputDir = path.join(tmpDir, "result");
  fs.mkdirSync(sampleOutputDir);
  writeOutputProjectFiles(projSpec.outputFiles!, sampleOutputDir);

  // Act
  await generateCode(projFile, (event: IProgressEvent) => console.log(event));

  // Assert: Run the codegen without exception for now
  // doAssert(path.join(projFile.folderPath, StandardFolder.OutputCode), sampleOutputDir);
});
