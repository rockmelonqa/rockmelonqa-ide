import os from "os";
import fs from "fs";
import path from "path";
import { createTestData } from "./project-meta.test-data";
import { createRmTestProject, createTempDir } from "../../test-helpers/rm-project-generator";
import { MsTestProjMeta } from "../../../src/codegen/playwright-csharp-mstest/msTestProjMeta";
import { createCodeGenMeta } from "../../../src/codegen/codegen";

test("Generate output project meta from RMProject", async () => {
  const projSpec = createTestData();

  const tmpDir = createTempDir("playwright-csharp-mstest");
  const copyToDir = path.join(tmpDir, "rmproj");
  fs.mkdirSync(copyToDir);
  const projFile = createRmTestProject(projSpec, copyToDir);
  const inProjMeta = await createCodeGenMeta(projFile);
  const outProjMeta = new MsTestProjMeta(inProjMeta);
  const suitesMeta = outProjMeta.createSuitesMeta();
  expect(outProjMeta).toBeTruthy();
});
