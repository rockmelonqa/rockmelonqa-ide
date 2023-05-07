import path from "path";
import { ExtensionToNameMap, IFileDef } from "../../file-defs";
import { IRmProjFile } from "../../file-defs/rmProjFile";
import { StandardFolder, StandardOutputFolder } from "../../file-defs";
import { IOutputFileInfo } from "../types";
import { languageExtensionMap } from "../utils/languageExtensionMap";
import { upperCaseFirstChar } from "../utils/stringUtils";

const inputOutputFolderMap = new Map<string, string>([
  [StandardFolder.PageDefinitions, StandardOutputFolder.Pages],
  [StandardFolder.TestCases, StandardOutputFolder.TestCases],
  [StandardFolder.TestSuites, StandardOutputFolder.TestSuites],
  [StandardFolder.TestRoutines, StandardOutputFolder.TestRoutines]
]);

const getContainerFolder = (inputFolderPath: string, projDir: string) => {
  let inputRelPath = inputFolderPath.replace(projDir, "").substring(1);
  let standardFolder = inputRelPath.split(path.sep)[0];
  return standardFolder;
};

const createName = (relativePath: string) => {
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

type IMetaParams = Pick<IFileDef, "folderPath" | "fileName" | "isValid">;

const createOutputFileInfo = (metaParams: IMetaParams, proj: IRmProjFile): IOutputFileInfo => {
  const { folderPath, fileName, isValid } = metaParams;

  const inputFileStandardFolder = getContainerFolder(folderPath, proj.folderPath);
  const inputContainerFolder = path.join(proj.folderPath, inputFileStandardFolder);
  const outputFileExt = languageExtensionMap[proj.content.language];
  const outputCodeDir = path.join(proj.folderPath, StandardFolder.OutputCode);
  const standardOutputFolder = inputOutputFolderMap.get(inputFileStandardFolder)!;
  const outputContainerFolder = path.join(outputCodeDir, standardOutputFolder);
  const inputFilePath = path.join(folderPath, fileName);

  // Path relative to the "standand folder", not the project root path;
  let inputFileRelPath = inputFilePath.substring(inputContainerFolder.length + 1);
  let outputFileCleanName = createName(inputFileRelPath);
  let outputFilePath = path.join(outputContainerFolder, outputFileCleanName.replaceAll("_", path.sep) + outputFileExt);

  const nameSegments = outputFileCleanName.split("_");
  const namespaceSegments = [...nameSegments];
  const outputFileClassName = namespaceSegments.pop() || "";
  const outputFileName = outputFileClassName + outputFileExt;
  const outputFileSubNamespace = namespaceSegments.length ? namespaceSegments.join(".") : "";
  const outputFileFullNamespace = `${proj.content.rootNamespace}.${standardOutputFolder}${
    outputFileSubNamespace ? "." + outputFileSubNamespace : ""
  }`;
  const outputFileRelPath = outputFilePath.replace(outputCodeDir, "").substring(1);

  return {
    inputFileName: path.parse(fileName).name,
    inputFilePath,
    inputFileRelPath,
    outputFileCleanName,
    outputFileName,
    outputFilePath,
    outputFileRelPath,
    outputFileClassName,
    outputFileSubNamespace,
    outputFileFullNamespace,
    isValid,
  };
};

export { createOutputFileInfo };
