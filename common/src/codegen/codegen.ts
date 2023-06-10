import recursive from "recursive-readdir";
import { v4 as uuidv4 } from "uuid";

import { info } from "console";
import fs from "fs";
import fse from "fs-extra";
import path from "path";

import {
  IRmProjFile,
  ISourceProjectMetadata,
  ITestRoutine,
  ITestRoutineFile,
  ITestSuite,
  ITestSuiteFile,
  StandardFileExtension,
  StandardFolder,
} from "../file-defs";
import { IPage, IPageFile } from "../file-defs/pageFile";
import { ITestCase, ITestCaseFile } from "../file-defs/testCaseFile";
import { IProgressEvent } from "../ipc-defs";
import { CodeGenFactory } from "./codegenFactory";
import { CodeGenMetaFactory } from "./codegenMetaFactory";
import { IOutputProjectMetadata } from "./types";
import parseContent from "./codegen-helpers/parseContent";
import { SourceFileParser } from "./codegen-helpers/sourceFileParser";

type ProgressEventCallback = (event: IProgressEvent) => void;

/** Reads all files in the provided directory recursively */
const readDirRecursive = async (dir: string) => {
  let paths = await new Promise<string[]>((rs, rj) =>
    recursive(dir, [], function (err: any, files: string[]) {
      if (err) {
        rj(err);
        return;
      }
      rs(files.map((f) => f.replace(dir, "").substring(1)));
    })
  );
  return paths;
};

/** Reads all files with the provided extension in the provided directory recursively. Extension includes the dot, eg ".page, .tcase" */
const readDirRecursiveFilterByExt = async (dir: string, ext: string) => {
  let paths = await readDirRecursive(dir);
  paths = paths.filter((filePath) => filePath.toLocaleLowerCase().endsWith(ext));
  return paths;
};

const buildWriteFileFn = (rmprojFile: IRmProjFile, progressNotify: ProgressEventCallback) => {
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

const copyCustomCode = async (rmprojFile: IRmProjFile, outputDir: string, progressNotify: ProgressEventCallback) => {
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

export const createSourceProjectMetadata = async (
  rmprojFile: IRmProjFile,
  progressNotify?: (event: IProgressEvent) => void
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

export const createOutputProjectMetadata = async (projFile: IRmProjFile): Promise<IOutputProjectMetadata> => {
  const inProjMeta = await createSourceProjectMetadata(projFile);
  const outProjMeta = CodeGenMetaFactory.newInstance(inProjMeta);
  const meta = outProjMeta.createOutputProjectMetadata();
  return meta;
};
