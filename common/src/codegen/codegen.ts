import { info } from "console";
import fs from "fs";
import fse from "fs-extra";
import path from "path";

import { IRmProjFile, StandardFolder } from "../file-defs";
import { CodeGenFactory } from "./codegenFactory";
import { ProgressEventCallback } from "./types";
import { buildWriteFileFn, copyCustomCode } from "./utils/codegenUtils";
import { createSourceProjectMetadata } from "./codegenSourceProjectMeta";

/** Generates test project */
export const generateCode = async (rmprojFile: IRmProjFile, progressNotify: ProgressEventCallback): Promise<void> => {
  info("#################");
  info("# GENERATE CODE #");
  info("#################");

  const projMeta = await createSourceProjectMetadata(rmprojFile, progressNotify);

  const writeFile = buildWriteFileFn(rmprojFile, progressNotify);

  const outputDir = path.join(rmprojFile.folderPath, StandardFolder.OutputCode);

  info(``);
  info(``);
  info(`--------------------------------------------------`);
  info(`-- Generating code to '${outputDir}'`);
  info("--------------------------------------------------");

  if (fs.existsSync(outputDir)) {
    progressNotify({ type: "clean-folder", log: `Cleaning folder: ${outputDir}` });
    fse.emptyDirSync(outputDir);
  }

  info(``);
  info(``);
  info(`--------------------------------------------------`);
  info(`-- Copy custom code`);
  info("--------------------------------------------------");
  await copyCustomCode(rmprojFile, outputDir, progressNotify);

  const codegen = CodeGenFactory.newInstance(projMeta);

  await codegen.generateCode(true, writeFile);

  // Done
  info(``);
  info(``);
  info(`Finish generating code!`);
};
