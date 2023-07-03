import os from "os";
import fs from "fs";
import path from "path";
import { createTestData } from "./playwright-typescript-meta.test-data";
import { createRmTestProject } from "../../test-helpers/rm-project-generator";
import { PlaywrightTypeScriptProjMeta } from "../../../src/codegen/playwright-typescript/playwrightTypeScriptMeta";
import { createSourceProjectMetadata } from "../../../src/codegen/codegenSourceProjectMeta";
import { createTempDir } from "../../test-helpers/fsHelpers";

test("Generate output projec meta Playwright Typescript", async () => {
  const projSpec = createTestData();

  const tmpDir = createTempDir("playwright-typescript-meta");
  const copyToDir = path.join(tmpDir, "rmproj");
  fs.mkdirSync(copyToDir);
  const projFile = createRmTestProject(projSpec, copyToDir);
  const sourceProjMeta = await createSourceProjectMetadata(projFile);
  const outputMetadataProcessor = new PlaywrightTypeScriptProjMeta(sourceProjMeta);
  const outputProjMetadata = outputMetadataProcessor.createOutputProjectMetadata();
  expect(outputMetadataProcessor).toBeTruthy();
});
