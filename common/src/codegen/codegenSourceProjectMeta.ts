import { info } from "console";
import fs from "fs";
import path from "path";

import { IRmProjFile, ISourceProjectMetadata, ITestRoutineFile, ITestSuiteFile, StandardFileExtension, StandardFolder } from "../file-defs";
import { IPageFile } from "../file-defs/pageFile";
import { ITestCaseFile } from "../file-defs/testCaseFile";
import { IProgressEvent } from "../ipc-defs";
import { SourceFileParser } from "./codegen-helpers/sourceFileParser";
import { readDirRecursiveFilterByExt } from "./utils/fileSystemHelpers";
import { ProgressEventCallback } from "./types";
import { IConfiguration, IConfigurationFile } from "../file-defs/configFile";

export const createSourceProjectMetadata = async (
  rmprojFile: IRmProjFile,
  progressNotify?: ProgressEventCallback
): Promise<ISourceProjectMetadata> => {
  const notify = (event: IProgressEvent) => progressNotify && progressNotify(event);

  notify({ type: "validate-input" });
  info(``);
  info(``);
  info(`--------------------------------------------------`);
  info(`-- Validating input`);
  info(`--------------------------------------------------`);

  info(`    ---> Project folder: ${rmprojFile.folderPath}`);

  if (!fs.existsSync(rmprojFile.folderPath)) {
    throw new Error(`'${rmprojFile.folderPath}' does not exist`);
  }

  let outputDir = path.join(rmprojFile.folderPath, StandardFolder.OutputCode);

  info(`    ---> Output folder: '${outputDir}'`);

  if (!fs.existsSync(outputDir)) {
    throw new Error(`'${outputDir}' does not exist`);
  }

  if (!rmprojFile.content.rootNamespace) {
    rmprojFile.content.rootNamespace = "AutomationTests";
    info(`    ---> Root Namespace is not set. Default to '${rmprojFile.content.rootNamespace}'`);
  }

  if (!rmprojFile.content.testIdAttributeName) {
    info(`    ---> Property testIdAttributeName is not set, will be defaulted to data-testid at runtime.`);
  }

  // Parsing config file
  info(``);
  info(``);
  info(`--------------------------------------------------`);
  info(`-- Parsing Configuration Variables files`);
  info("--------------------------------------------------");

  let configFiles: IConfigurationFile[] = [];
  let configFolder = path.join(rmprojFile.folderPath, StandardFolder.Config);
  let configFilePaths: string[] = await readDirRecursiveFilterByExt(configFolder, StandardFileExtension.Environment);

  for (let configFilePath of configFilePaths) {
    notify({ type: "parse-data", log: `Parsing: ${configFilePath}` });
    info(`    ---> Found configuration variables file: ${configFilePath}`);
    configFiles.push(await SourceFileParser.parseConfiguration(configFolder, configFilePath));
  }

  // Parsing page definitions
  info(``);
  info(``);
  info(`--------------------------------------------------`);
  info(`-- Parsing page definitions`);
  info("--------------------------------------------------");

  let pageFiles: IPageFile[] = [];
  let pageDefFolder = path.join(rmprojFile.folderPath, StandardFolder.PageDefinitions);
  let pageDefinitionFilePaths: string[] = await readDirRecursiveFilterByExt(pageDefFolder, StandardFileExtension.Page);

  for (let pageDefinitionFile of pageDefinitionFilePaths) {
    notify({ type: "parse-data", log: `Parsing: ${pageDefinitionFile}` });
    info(`    ---> Found page definition file: ${pageDefinitionFile}`);
    pageFiles.push(await SourceFileParser.parsePageDefinition(pageDefFolder, pageDefinitionFile));
  }

  // Parsing test suite definitions
  info(``);
  info(``);
  info(`--------------------------------------------------`);
  info(`-- Parsing test suite definitions`);
  info("--------------------------------------------------");

  let suiteFiles: ITestSuiteFile[] = [];
  let testSuiteFolderPath = path.join(rmprojFile.folderPath, StandardFolder.TestSuites);
  let testSuiteFilePaths = await readDirRecursiveFilterByExt(testSuiteFolderPath, StandardFileExtension.TestSuite);

  for (let testSuiteDefFile of testSuiteFilePaths) {
    notify({ type: "parse-data", log: `Parsing: ${testSuiteDefFile}` });
    info(`    ---> Found test suite file: ${testSuiteDefFile}`);
    suiteFiles.push(await SourceFileParser.parseTestSuite(testSuiteFolderPath, testSuiteDefFile));
  }

  // Parsing test case definitions
  info(``);
  info(``);
  info(`--------------------------------------------------`);
  info(`-- Parsing test case definitions`);
  info("--------------------------------------------------");

  let caseFiles: ITestCaseFile[] = [];
  let testCaseFolderPath = path.join(rmprojFile.folderPath, StandardFolder.TestCases);

  let testCaseFileRelPaths = await readDirRecursiveFilterByExt(testCaseFolderPath, StandardFileExtension.TestCase);

  for (let testCaseDefFile of testCaseFileRelPaths) {
    caseFiles.push(await SourceFileParser.parseTestCase(testCaseFolderPath, testCaseDefFile));
    notify({ type: "parse-data", log: `Parsing: ${testCaseDefFile}` });
    info(`    ---> Found test case file: ${testCaseDefFile}`);
  }

  // Parsing test routine definitions
  info(``);
  info(``);
  info(`--------------------------------------------------`);
  info(`-- Parsing test routine definitions`);
  info("--------------------------------------------------");

  let routineFiles: ITestRoutineFile[] = [];

  let testRoutineFolderPath = path.join(rmprojFile.folderPath, StandardFolder.TestRoutines);

  if (fs.existsSync(testRoutineFolderPath)) {
    let testRoutineFileRelPaths = await readDirRecursiveFilterByExt(testRoutineFolderPath, StandardFileExtension.TestRoutine);

    for (let testRoutineDefFile of testRoutineFileRelPaths) {
      routineFiles.push(await SourceFileParser.parseTestRoutine(testRoutineFolderPath, testRoutineDefFile));
      notify({ type: "parse-data", log: `Parsing: ${testRoutineDefFile}` });
      info(`    ---> Found test routine file: ${testRoutineDefFile}`);
    }
  }

  let projMeta: ISourceProjectMetadata = {
    project: rmprojFile,
    pages: pageFiles,
    testCases: caseFiles,
    testSuites: suiteFiles,
    testRoutines: routineFiles,
    configFiles: configFiles,
  };

  return projMeta;
};
