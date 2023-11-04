import os from "os";
import fs from "fs";
import path from "path";
import { createRmTestProject, writeOutputProjectFiles } from "../../test-helpers/rm-project-generator";
import { PlaywrightTypeScriptProjMetaGenerator } from "../../../src/codegen/playwright-typescript/playwrightTypeScriptMetaGenerator";
import { createTempDir } from "../../test-helpers/fsHelpers";
import { generateCode } from "../../../src/codegen";
import { IProgressEvent } from "../../../src";
import { execSync } from "child_process";
import { createTestDataKitchenSink } from "../playwright-csharp-common/playwright-common.test-data";
const tempDir = path.resolve(__dirname, "../../.tmp");

test("Generate Test project Playwright Typescript General", async () => {
  // Arrange
  const projSpec = createTestDataKitchenSink();
  const tmpDir = createTempDir("playwright-typescript-general");
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
