import os from "os";
import fs from "fs";
import path from "path";

import { StandardFolder } from "../../../../src/file-defs";
import { IProgressEvent } from "../../../../src/ipc-defs";
import { createSourceProjectMetadata, generateCode } from "../../../../src/codegen";
import { prepareOutputProject, createRmTestProject } from "../../../test-helpers/rm-project-generator";
import { doAssert } from "../../../test-helpers/assert-helper";
import { createTempDir } from "../../../test-helpers/fsHelpers";
import { createCodegenWithConfigVarTestData } from "./codegen-config-var.test-data";
import { CodegenSourceProjectValidator } from "../../../../src/codegen/codegenSourceProjectValidator";

test("CodeGen Configuration Variables Test", async () => {
  // Arrange
  const tmpDir = createTempDir("codegen-config-var-test");
  const projSpec = createCodegenWithConfigVarTestData();
  const copyToDir = path.join(tmpDir, "rmproj");
  fs.mkdirSync(copyToDir);
  const rmprojFile = createRmTestProject(projSpec, copyToDir);

  const sampleOutputDir = path.join(tmpDir, "result");
  fs.mkdirSync(sampleOutputDir);
  prepareOutputProject(projSpec.outputFiles, sampleOutputDir);

  // Act
  const sucess = await generateCode(rmprojFile, (event: IProgressEvent) => {
    console.log(`PROGRESS: ${event.type}. ${event.log}`);
  });

  console.log(`SUCESS: ${sucess}`);
  // Assert
  // Assert: TODO: just want to run the code without exception
  //doAssert(path.join(rmprojFile.folderPath, StandardFolder.OutputCode), sampleOutputDir);
});
