import fs from "fs";
import path from "path";

import { IProgressEvent } from "../../../src/ipc-defs";
import { generateCode } from "../../../src/codegen";
import { writeOutputProjectFiles, createRmTestProject } from "../../test-helpers/rm-project-generator";
import { createTempDir } from "../../test-helpers/fsHelpers";

import { AutomationFramework, Indent, Language, StandardFolder, TestFramework } from "../../../src/file-defs";
import { RmpSpec } from "../../test-helpers/rm-project-spec.types";
import { createTestDataKitchenSink } from "../playwright-csharp-common/playwright-common.test-data";
const PROJ_NAME = "playwright-csharp-nunit";

export const createPlaywrightNunitTestData = (): RmpSpec => {
  const kitchenSinkData = createTestDataKitchenSink();
  return {
    projectName: PROJ_NAME,
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

test("CodeGen Playwright CSharp Nunit", async () => {
  // Arrange
  const tmpDir = createTempDir(PROJ_NAME);
  const projSpec = createPlaywrightNunitTestData();
  const copyToDir = path.join(tmpDir, "rmproj");
  fs.mkdirSync(copyToDir);
  const projFile = createRmTestProject(projSpec, copyToDir);

  const sampleOutputDir = path.join(tmpDir, "result");
  fs.mkdirSync(sampleOutputDir);
  writeOutputProjectFiles(projSpec.outputFiles!, sampleOutputDir);

  // Act
  await generateCode(projFile, (event: IProgressEvent) => {
    console.log(`PROGRESS: ${event.type}. ${event.log}`);
  });

  // Assert
  // doAssert(path.join(projFile.folderPath, StandardFolder.OutputCode), sampleOutputDir);
});
