import os from "os";
import fs from "fs";
import path from "path";

import { StandardFolder } from "../../../src/file-defs";
import { IProgressEvent } from "../../../src/ipc-defs";
import { createSourceProjectMetadata, generateCode } from "../../../src/codegen";
import { prepareOutputProject, createRmTestProject } from "../../test-helpers/rm-project-generator";
import { doAssert } from "../../test-helpers/assert-helper";
import { createTempDir } from "../../test-helpers/fsHelpers";
import { createCodegenValidatorTestData } from "./codegen-validator.test.test-data";
import { CodegenSourceProjectValidator } from "../../../src/codegen/codegenSourceProjectValidator";

test("CodeGen Source Project Files Validator Test", async () => {
  // Arrange
  const tmpDir = createTempDir("codegen-validator-test");
  const projSpec = createCodegenValidatorTestData();
  const copyToDir = path.join(tmpDir, "rmproj");
  fs.mkdirSync(copyToDir);
  const rmprojFile = createRmTestProject(projSpec, copyToDir);

  const sampleOutputDir = path.join(tmpDir, "result");
  fs.mkdirSync(sampleOutputDir);
  prepareOutputProject(projSpec.outputFiles, sampleOutputDir);

  const sourceProjMeta = await createSourceProjectMetadata(rmprojFile);

  // Act
  const errors = new CodegenSourceProjectValidator(sourceProjMeta).validate();
  console.log("errors", errors);
  // Assert: TODO: just want to run the code without exception
});
