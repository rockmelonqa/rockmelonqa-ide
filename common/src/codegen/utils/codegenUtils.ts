import { info } from "console";
import fs from "fs";
import fse from "fs-extra";
import path from "path";
import { IRmProjFile, StandardFolder } from "../../file-defs";
import { ProgressEventCallback } from "../types";

export const buildWriteFileFn = (rmprojFile: IRmProjFile, progressNotify: ProgressEventCallback) => {
  return async (relativeFilePath: string, content: string) => {
    progressNotify({ type: "generate-code", log: `Creating file: '${relativeFilePath}'` });
    info("-- writeFile", relativeFilePath);

    let absoluteFilePath = path.join(rmprojFile.folderPath, StandardFolder.OutputCode, relativeFilePath);
    let folder = path.dirname(absoluteFilePath);
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    fs.writeFileSync(absoluteFilePath, content);
  };
};

export const copyCustomCode = async (rmprojFile: IRmProjFile, outputDir: string, progressNotify: ProgressEventCallback) => {
  try {
    const customCodeDir = path.join(rmprojFile.folderPath, StandardFolder.CustomCode);
    if (fs.existsSync(customCodeDir)) {
      progressNotify({ type: "copy-custom-code", log: `Copying custom code from '${customCodeDir}' to '${outputDir}'` });
      await fs.promises.cp(customCodeDir, outputDir, {
        recursive: true,
      });
    }
  } catch (err) {
    console.log("CANNOT copy custom code");
    console.error(err);
    throw err;
  }
};
