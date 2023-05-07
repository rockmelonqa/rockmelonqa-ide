import os from "os";
import fs from "fs";
import path from "path";
import { createTestData } from "./project-meta.test-data";
import { createRmTestProject } from "../../test-helpers/rm-project-generator";
import { MsTestProjMeta } from "../../../src/codegen/playwright-csharp-mstest/msTestProjMeta";
import { createCodeGenMeta } from "../../../src/codegen/codegen";
import { createTempDir } from "../../test-helpers/fsHelpers";

test("Generate output project meta from RMProject", async () => {
  const projSpec = createTestData();

  const tmpDir = createTempDir("playwright-csharp-mstest");
  const copyToDir = path.join(tmpDir, "rmproj");
  fs.mkdirSync(copyToDir);
  const projFile = createRmTestProject(projSpec, copyToDir);
  const inProjMeta = await createCodeGenMeta(projFile);
  const outputMetadataProcessor = new MsTestProjMeta(inProjMeta);
  const outputProjMetadata = outputMetadataProcessor.createOutputProjectMetadata();
  expect(outputMetadataProcessor).toBeTruthy();
});
