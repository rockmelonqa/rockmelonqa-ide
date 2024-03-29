import path from "path";
import { ExtensionToNameMap } from "../../file-defs";
import { upperCaseFirstChar } from "./stringUtils";

/** Creates a valid output file name (without extension) from the input file relative path */
export const createName = (sourceFileRelPath: string) => {
  let ext = path.extname(sourceFileRelPath).toLocaleLowerCase();
  let nameSuffix = upperCaseFirstChar(ExtensionToNameMap[ext]);

  let filenameWithoutExt = sourceFileRelPath
    .replace(/\..+$/, "") // Remove the extension
    .replaceAll(path.sep, "_") // Replace path separator with underscore
    .replace(/\W/g, "") // Removing non-alphanumeric chars
    .replace(/ +/g, ""); // Remove space(s)

  filenameWithoutExt = filenameWithoutExt
    .split("_")
    .map((w) => upperCaseFirstChar(w))
    .join("_");

  return `${filenameWithoutExt}${nameSuffix}`;
};

export const createCleanName = (sourceName: string) => {
  let cleanName = sourceName
    .replace(/\..+$/, "") // Remove the extension
    .replaceAll(path.sep, "_") // Replace path separator with underscore
    .replace(/\W/g, "") // Removing non-alphanumeric chars
    .replace(/ +/g, ""); // Remove space(s)

  let csharpCleanName = cleanName
    .split("_")
    .map((w) => upperCaseFirstChar(w))
    .join("_");

  return `${csharpCleanName}`;
};
