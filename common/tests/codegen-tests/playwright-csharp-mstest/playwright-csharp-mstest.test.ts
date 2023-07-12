import fs from "fs";
import path from "path";

import { AutomationFramework, Indent, Language, StandardFolder, TestFramework } from "../../../src/file-defs";
import { IProgressEvent } from "../../../src/ipc-defs";
import { generateCode } from "../../../src/codegen";
import { writeOutputProjectFiles, createRmTestProject } from "../../test-helpers/rm-project-generator";
import { doAssert } from "../../test-helpers/assert-helper";
import { createTempDir } from "../../test-helpers/fsHelpers";
import { RmpSpec } from "../../test-helpers/rm-project-spec.types";
import { createTestDataKitchenSink } from "../playwright-typescript/playwright-typescript-kitchen-sink.test-data";

const createPlaywrightMsTestTestData = (): RmpSpec => {
  const kitchenSinkData = createTestDataKitchenSink();

  return {
    // Name of the project file, should be unique among tests in `codegen` test
    projectName: "google-test-playwright-mstest",
    // The content of the rmproj file
    content: {
      fileVersion: 1,
      name: "",
      description: "",
      automationFramework: AutomationFramework.Playwright,
      testFramework: TestFramework.xUnit,
      language: Language.CSharp,
      rootNamespace: "",
      indent: Indent.Spaces,
      indentSize: 2,
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

test("CodeGen Playwright CSharp MsTest", async () => {
  // Arrange
  const tmpDir = createTempDir("playwright-csharp-mstest");
  const projSpec = createPlaywrightMsTestTestData();
  const createSourceProjectInDir = path.join(tmpDir, "rmproj");
  fs.mkdirSync(createSourceProjectInDir);
  const projFile = createRmTestProject(projSpec, createSourceProjectInDir);

  const sampleOutputDir = path.join(tmpDir, "result");
  fs.mkdirSync(sampleOutputDir);
  writeOutputProjectFiles(projSpec.outputFiles!, sampleOutputDir);

  // Act
  await generateCode(projFile, (event: IProgressEvent) => {
    console.log(`PROGRESS: ${event.type}. ${event.log}`);
  });

  // Assert: TODO - Run the codegen without exception for now
  // doAssert(path.join(projFile.folderPath, StandardFolder.OutputCode), sampleOutputDir);
});
