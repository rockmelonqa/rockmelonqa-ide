import path from "path";
import { IFileDef, StandardFolder, StandardOutputFolder } from "../../file-defs";
import { IRmProjFile } from "../../file-defs/rmProjFile";
import { IOutputFileInfo } from "../types";
import { languageExtensionMap } from "../utils/languageExtensionMap";
import createName from "../utils/createName";

/** Map from standard input folder to standard output folder */
const inputOutputFolderMap = new Map<string, string>([
  [StandardFolder.PageDefinitions, StandardOutputFolder.Pages],
  [StandardFolder.TestCases, StandardOutputFolder.TestCases],
  [StandardFolder.TestSuites, StandardOutputFolder.TestSuites],
  [StandardFolder.TestRoutines, StandardOutputFolder.TestRoutines],
]);

/** Gets the standard folder name (e.g "test-suites", "test-cases", etc...) from the provided folder path */
const getContainerFolder = (inputFolderPath: string, projDir: string) => {
  // Remove the projectDir from the inputFolderPath: eg. "D:\Insurance\test-suites\Insurance.tsuite" => "test-suites\Insurance.tsuite"
  let inputRelPath = inputFolderPath.replace(projDir, "").substring(1);
  // The standard input folder name should be the first path segment: "test-suites\Insurance.tsuite" => "test-suites"
  let standardFolder = inputRelPath.split(path.sep)[0];

  return standardFolder;
};

/** The input metadata needed to generate valid output file metadata */
type IMetaParams = Pick<IFileDef, "folderPath" | "fileName" | "isValid">;

/** Creates output file info with the provided input file meta*/
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
  let outputFilePath = path.join(outputContainerFolder, outputFileCleanName + outputFileExt);

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
