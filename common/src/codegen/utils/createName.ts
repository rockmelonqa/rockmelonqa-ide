import path from "path";
import { upperCaseFirstChar } from "./stringUtils";
import { ExtensionToNameMap } from "rockmelonqa.common/file-defs";

/** Creates a valid name (with extension) from the input file relative path */
export default (relativePath: string) => {
  let ext = path.extname(relativePath).toLocaleLowerCase();
  let extName = upperCaseFirstChar(ExtensionToNameMap[ext]);

  let filenameWithoutExt = relativePath
    .replace(/\..+$/, "") // Remove the extension
    .replaceAll(path.sep, "_") // Replace path separator with underscore
    .replace(/\W/g, "") // Removing non-alphanumeric chars
    .replace(/ +/g, ""); // Remove space(s)

  filenameWithoutExt = filenameWithoutExt
    .split("_")
    .map((w) => upperCaseFirstChar(w))
    .join("_");

  return `${filenameWithoutExt}${extName}`;
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
