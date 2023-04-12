console.log("Clean output folders");
import fs from "fs";
import path from "path";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const __rootDir = path.resolve(__dirname, "..");

const deleteFolderRecursive = function (directoryPath) {
  if (fs.existsSync(directoryPath)) {
    fs.readdirSync(directoryPath).forEach((file, index) => {
      const curPath = path.join(directoryPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        deleteFolderRecursive(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(directoryPath);
    return;
  }
  console.warn("Directory doesn't exist for cleaning: " + directoryPath);
};

deleteFolderRecursive(path.join(__rootDir, "dist/commonjs"));
deleteFolderRecursive(path.join(__rootDir, "dist/module"));
