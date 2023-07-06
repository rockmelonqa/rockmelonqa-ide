import path from "path";
import os from "os";
import fs from "fs";
import fse from "fs-extra";

// const tempDir = os.tmpdir();
const tempDir = path.resolve(__dirname, "../../.tmp");

/** Creates folder in the tmp directory; If the folder exists, it will be emptied; Returns the path to the new folder */
export const createTempDir = (desc: string) => {
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  const commonTmpDir = path.join(tempDir, "rockmelon-sample-rmproj");

  if (!fs.existsSync(commonTmpDir)) {
    fs.mkdirSync(commonTmpDir);
  }

  // Use actual timestamp to ensure unique names
  // const timestamp = moment().format("YYYYMMDD_HHmmss");
  const timestamp = "00000000_000000";
  const sampleTmpDir = path.join(commonTmpDir, `${timestamp}_${desc}`);

  if (fs.existsSync(sampleTmpDir)) {
    fse.emptyDirSync(sampleTmpDir);
  } else {
    fs.mkdirSync(sampleTmpDir);
  }

  return sampleTmpDir;
};

/** Writes the content to file. If the content is not a string, it will be JSON.stringify()-ed */
export const writeFile = (content: any, filePath: string) => {
  let containerDir = path.dirname(filePath);
  if (!fs.existsSync(containerDir)) {
    fs.mkdirSync(containerDir, { recursive: true });
  }

  fs.writeFileSync(filePath, typeof content === "string" ? content : JSON.stringify(content, null, 4));
};

/** Creates a directory if it doesn't exist */
export const createDir = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};
