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

/** Parses the json string. If parse successfully, return the [content, true]; If not, return [{<empty object>}, false] */
const parseContent = <TContent>(contentStr: string): [TContent, boolean] => {
  try {
    let obj = JSON.parse(contentStr);
    return [obj, true];
  } catch {
    return [{} as TContent, false];
  }
};

const parsePageDefinition = async (parentDir: string, fileRelPath: string): Promise<IPageFile> => {
  let filePath = path.join(parentDir, fileRelPath);
  let fileContent = fs.readFileSync(filePath, "utf-8");
  let [page, isValid] = parseContent<IPage>(fileContent);

  // Provide an empty elements array so that codegen can generate a page class with no property
  if (!isValid) {
    page.id = uuidv4();
    page.elements = [];
  }

  return {
    content: page,
    fileName: path.basename(filePath),
    folderPath: path.dirname(filePath),
    isValid,
  };
};

const parseTestCase = async (parentDir: string, fileRelPath: string): Promise<ITestCaseFile> => {
  let filePath = path.join(parentDir, fileRelPath);
  let fileContent = fs.readFileSync(filePath, "utf-8");
  let [testcase, isValid] = parseContent<ITestCase>(fileContent);

  // Provide an empty steps array so that codegen can generate a case class with no step
  if (!isValid) {
    testcase.id = uuidv4();
    testcase.steps = [];
  }

  return {
    content: testcase,
    fileName: path.basename(filePath),
    folderPath: path.dirname(filePath),
    isValid,
  };
};

const parseTestSuite = async (parentDir: string, fileRelPath: string): Promise<ITestSuiteFile> => {
  let filePath = path.join(parentDir, fileRelPath);
  let fileContent = fs.readFileSync(filePath, "utf-8");
  let [testsuite, isValid] = parseContent<ITestSuite>(fileContent);

  // Provide an testcases elements array so that codegen can generate a suite class with no test case
  if (!isValid) {
    testsuite.id = uuidv4();
    testsuite.testcases = [];
  }

  return {
    content: testsuite,
    fileName: path.basename(filePath),
    folderPath: path.dirname(filePath),
    isValid,
  };
};

const parseTestRoutine = async (parentDir: string, fileRelPath: string): Promise<ITestRoutineFile> => {
  let filePath = path.join(parentDir, fileRelPath);
  let fileContent = fs.readFileSync(filePath, "utf-8");
  let [testRoutine, isValid] = parseContent<ITestRoutine>(fileContent);
  return {
    content: testRoutine,
    fileName: path.basename(filePath),
    folderPath: path.dirname(filePath),
    isValid,
  };
};

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

/** Generates test project */
export const generateCode = async (rmprojFile: IRmProjFile, progressNotify: (event: IProgressEvent) => void): Promise<void> => {
  info("#################");
  info("# GENERATE CODE", rmprojFile);
  info("#################");

  const projMeta = await createSourceProjectMetadata(rmprojFile, progressNotify);

  const writeFile = async (relativeFilePath: string, content: string) => {
    progressNotify({ type: "generate-code", log: `Creating file: '${relativeFilePath}'` });
    info("-- writeFile", relativeFilePath);

    let absoluteFilePath = path.join(rmprojFile.folderPath, StandardFolder.OutputCode, relativeFilePath);
    let folder = path.dirname(absoluteFilePath);
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    fs.writeFileSync(absoluteFilePath, content);
  };

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
  let pageDefinitionFiles: string[] = (await readDirRecursive(pageDefFolder)).filter((name) =>
    name.toLocaleLowerCase().endsWith(StandardFileExtension.Page)
  );

  for (let pageDefinitionFile of pageDefinitionFiles) {
    notify({ type: "parse-data", log: `Parsing: ${pageDefinitionFile}` });
    info(`    ---> Found page definition file: ${pageDefinitionFile}`);
    pages.push(await parsePageDefinition(pageDefFolder, pageDefinitionFile));
  }

  // Parsing test suite definitions
  info(``);
  info(``);
  info(`--------------------------------------------------`);
  info(`-- Parsing test suite definitions`);
  info("--------------------------------------------------");

  let suites: ITestSuiteFile[] = [];
  let testSuiteFolderPath = path.join(rmprojFile.folderPath, StandardFolder.TestSuites);
  let testSuiteFilePaths = await readDirRecursive(testSuiteFolderPath);

  for (let testSuiteDefFile of testSuiteFilePaths) {
    notify({ type: "parse-data", log: `Parsing: ${testSuiteDefFile}` });
    info(`    ---> Found test suite file: ${testSuiteDefFile}`);
    suites.push(await parseTestSuite(testSuiteFolderPath, testSuiteDefFile));
  }

  // Parsing test case definitions
  info(``);
  info(``);
  info(`--------------------------------------------------`);
  info(`-- Parsing test case definitions`);
  info("--------------------------------------------------");

  let cases: ITestCaseFile[] = [];
  let testCaseFolderPath = path.join(rmprojFile.folderPath, StandardFolder.TestCases);

  let testCaseFileRelPaths = await readDirRecursive(testCaseFolderPath);

  for (let testCaseDefFile of testCaseFileRelPaths) {
    cases.push(await parseTestCase(testCaseFolderPath, testCaseDefFile));
    notify({ type: "parse-data", log: `Parsing: ${testCaseDefFile}` });
    info(`    ---> Found test case file: ${testCaseDefFile}`);
  }

  let routines: ITestRoutineFile[] = [];

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
