import os from "os";
import fs from "fs";
import path from "path";
import { createRmTestProject } from "../../test-helpers/rm-project-generator";
import { MsTestProjMetaGenerator } from "../../../src/codegen/playwright-csharp-mstest/msTestProjMetaGenerator";
import { createSourceProjectMetadata } from "../../../src/codegen/codegenSourceProjectMeta";
import { createTempDir } from "../../test-helpers/fsHelpers";
import { RmpSpec } from "../../test-helpers/rm-project-spec.types";
import { createTestDataKitchenSink } from "./playwright-common.test-data";
import { AutomationFramework, Indent, Language, TestFramework } from "../../../src";

const createTestData = (): RmpSpec => {
  const kitchenSinkData = createTestDataKitchenSink();

  return {
    // Name of the project file, should be unique among tests in `codegen` test
    projectName: "project-meta-mstest",
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

test("Generate output project meta from RMProject", async () => {
  const projSpec = createTestData();

  const tmpDir = createTempDir("playwright-csharp-mstest");
  const copyToDir = path.join(tmpDir, "rmproj");
  fs.mkdirSync(copyToDir);
  const projFile = createRmTestProject(projSpec, copyToDir);
  const sourceProjMeta = await createSourceProjectMetadata(projFile);
  const outputMetadataProcessor = new MsTestProjMetaGenerator(sourceProjMeta);
  const outputProjMetadata = outputMetadataProcessor.createOutputProjectMetadata();
  expect(outputMetadataProcessor).toBeTruthy();
});
