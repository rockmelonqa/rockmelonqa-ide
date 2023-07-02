import fs from "fs";
import path from "path";

import { IProgressEvent } from "../../../src/ipc-defs";
import { generateCode } from "../../../src/codegen";
import { writeOutputProjectFiles, createRmTestProject } from "../../test-helpers/rm-project-generator";
import { createPlaywrightNunitTestData } from "./playwright-csharp-nunit.test-data";
import { createTempDir } from "../../test-helpers/fsHelpers";

test("CodeGen Playwright CSharp Nunit - General", async () => {
  // Arrange
  const tmpDir = createTempDir("playwright-csharp-nunit-general");
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
