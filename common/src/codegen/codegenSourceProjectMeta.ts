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

export const createSourceProjectMetadata = async (
  rmprojFile: IRmProjFile,
  progressNotify?: ProgressEventCallback
): Promise<ISourceProjectMetadata> => {
  const notify = (event: IProgressEvent) => progressNotify && progressNotify(event);

  // Print out information about the context
  info(``);
  info(``);
  info(`--------------------------------------------------`);
  info(`-- Rockmelon QA`);
  info(`-- Framework: ${rmprojFile.content.automationFramework}`);
  info(`-- Language: ${rmprojFile.content.language}`);
  info(`-- Test Framework: ${rmprojFile.content.testFramework}`);
  info(`-- Date: ${new Date()}`);
  info(`--------------------------------------------------`);

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

  // Parsing page definitions
  info(``);
  info(``);
  info(`--------------------------------------------------`);
  info(`-- Parsing page definitions`);
  info("--------------------------------------------------");

  let pages: IPageFile[] = [];
  let pageDefFolder = path.join(rmprojFile.folderPath, StandardFolder.PageDefinitions);
  let pageDefinitionFiles: string[] = await readDirRecursiveFilterByExt(pageDefFolder, StandardFileExtension.Page);

  for (let pageDefinitionFile of pageDefinitionFiles) {
    notify({ type: "parse-data", log: `Parsing: ${pageDefinitionFile}` });
    info(`    ---> Found page definition file: ${pageDefinitionFile}`);
    pages.push(await SourceFileParser.parsePageDefinition(pageDefFolder, pageDefinitionFile));
  }

  // Parsing test suite definitions
  info(``);
  info(``);
  info(`--------------------------------------------------`);
  info(`-- Parsing test suite definitions`);
  info("--------------------------------------------------");

  let suites: ITestSuiteFile[] = [];
  let testSuiteFolderPath = path.join(rmprojFile.folderPath, StandardFolder.TestSuites);
  let testSuiteFilePaths = await readDirRecursiveFilterByExt(testSuiteFolderPath, StandardFileExtension.TestSuite);

  for (let testSuiteDefFile of testSuiteFilePaths) {
    notify({ type: "parse-data", log: `Parsing: ${testSuiteDefFile}` });
    info(`    ---> Found test suite file: ${testSuiteDefFile}`);
    suites.push(await SourceFileParser.parseTestSuite(testSuiteFolderPath, testSuiteDefFile));
  }

  // Parsing test case definitions
  info(``);
  info(``);
  info(`--------------------------------------------------`);
  info(`-- Parsing test case definitions`);
  info("--------------------------------------------------");

  let cases: ITestCaseFile[] = [];
  let testCaseFolderPath = path.join(rmprojFile.folderPath, StandardFolder.TestCases);

  let testCaseFileRelPaths = await readDirRecursiveFilterByExt(testCaseFolderPath, StandardFileExtension.TestCase);

  for (let testCaseDefFile of testCaseFileRelPaths) {
    cases.push(await SourceFileParser.parseTestCase(testCaseFolderPath, testCaseDefFile));
    notify({ type: "parse-data", log: `Parsing: ${testCaseDefFile}` });
    info(`    ---> Found test case file: ${testCaseDefFile}`);
  }

  // Parsing test routine definitions
  info(``);
  info(``);
  info(`--------------------------------------------------`);
  info(`-- Parsing test routine definitions`);
  info("--------------------------------------------------");

  let routines: ITestRoutineFile[] = [];

  let testRoutineFolderPath = path.join(rmprojFile.folderPath, StandardFolder.TestRoutines);

  if (fs.existsSync(testRoutineFolderPath)) {
    let testRoutineFileRelPaths = await readDirRecursiveFilterByExt(testRoutineFolderPath, StandardFileExtension.TestRoutine);

    for (let testRoutineDefFile of testRoutineFileRelPaths) {
      routines.push(await SourceFileParser.parseTestRoutine(testRoutineFolderPath, testRoutineDefFile));
      notify({ type: "parse-data", log: `Parsing: ${testRoutineDefFile}` });
      info(`    ---> Found test routine file: ${testRoutineDefFile}`);
    }
  }

  let projMeta: ISourceProjectMetadata = {
    project: rmprojFile,
    pages: pages,
    testCases: cases,
    testSuites: suites,
    testRoutines: routines,
  };

  return projMeta;
};
