import os from "os";
import fs from "fs";
import path from "path";
import { createTestData } from "./project-meta.test-data";
import { createRmTestProject } from "../../test-helpers/rm-project-generator";
import { MsTestProjMeta } from "../../../src/codegen/playwright-csharp-mstest/msTestProjMeta";
import { createSourceProjectMetadata } from "../../../src/codegen/codegenSourceProjectMeta";
import { createTempDir } from "../../test-helpers/fsHelpers";
import { createTestDataPlaywrightCsharpRoutines } from "./routines.test-data";

test("Playwright Csharp Routine", async () => {
  const projSpec = createTestDataPlaywrightCsharpRoutines();

  const tmpDir = createTempDir("playwright-csharp-routines");
  const copyToDir = path.join(tmpDir, "rmproj");
  fs.mkdirSync(copyToDir);
  const projFile = createRmTestProject(projSpec, copyToDir);
  const sourceProjMeta = await createSourceProjectMetadata(projFile);
  const outputMetadataProcessor = new MsTestProjMeta(sourceProjMeta);
  const outputProjMetadata = outputMetadataProcessor.createOutputProjectMetadata();

  expect(outputMetadataProcessor).toBeTruthy();
});
