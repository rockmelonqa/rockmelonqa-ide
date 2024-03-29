import os from "os";
import fs from "fs";
import path from "path";
import { createTestDataGeneral } from "./playwright-typescript-general.test-data";
import { createRmTestProject, writeOutputProjectFiles } from "../../test-helpers/rm-project-generator";
import { PlaywrightTypeScriptProjMetaGenerator } from "../../../src/codegen/playwright-typescript/playwrightTypeScriptMetaGenerator";
import { createTempDir } from "../../test-helpers/fsHelpers";
import { generateCode } from "../../../src/codegen";
import { AutomationFramework, IProgressEvent, Indent, Language } from "../../../src";
import { execSync } from "child_process";
import { createTestDataKitchenSink } from "./playwright-typescript-kitchen-sink.test-data";
import { RmpSpec } from "../../test-helpers/rm-project-spec.types";
const tempDir = path.resolve(__dirname, "../../.tmp");

const createTestDataPlaywrightTypeScript = (): RmpSpec => {
  const kitchenSinkData = createTestDataKitchenSink();

  return {
    projectName: "playwright-typescript-kitchen-sink",
    content: {
      fileVersion: 1,
      name: "",
      description: "",
      automationFramework: AutomationFramework.Playwright,
      testFramework: "",
      language: Language.Typescript,
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

test("Generate Test project Playwright Typescript KitchenSink", async () => {
  // Arrange
  const projSpec = createTestDataPlaywrightTypeScript();
  const tmpDir = createTempDir("playwright-typescript-kitchen-sink");
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

  // Assert: TODO - Run the codegen without exception for now
  // doAssert(path.join(projFile.folderPath, StandardFolder.OutputCode), sampleOutputDir);
});

test("Run Playwright Typescript test project", async () => {
  const testDir = path.join(
    tempDir,
    `.rockmelon-sample-rmproj\\00000000_000000_playwright-typescript-general\\rmproj\\output-code`
  );

  const cmd = "npx playwright test";
  console.log(`Executing: '${cmd}'.`);

  try {
    const output = execSync(cmd, { encoding: "utf-8" });
    console.log(`Executed: '${cmd}'.`);
    console.log(`output: '${output}'.`);
  } catch (err) {
    console.log(`EXecute failed: '${err}'.`);
  }
});
