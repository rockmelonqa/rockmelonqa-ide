import path from "path";
import {
  IEnvironmentContent,
  IEnvironmentFile,
  IRmProjFile,
  ITestCase,
  ITestCaseFile,
  ITestRoutine,
  ITestRoutineFile,
  ITestSuite,
  ITestSuiteFile,
  StandardFolder,
  StandardOutputFolder,
} from "../../file-defs";
import { IPage, IPageFile } from "../../file-defs/pageFile";
import { IOutputFileInfo, IOutputProjectMetadata } from "../types";
import { IOutputFileInfoBuilder, OutputFileInfoBuilderFactory, createOutputFileInfo } from "./createOutputFileInfo";
import { Platform } from "../../file-defs/platform";

/** For generating output project metadata */
export interface IOutputProjectMetadataGenerator {
  createOutputProjectMetadata: () => IOutputProjectMetadata;
  get: (guid: string) => IOutputFileInfo;
}

export class MapCreator {
  outputFileInfoBuilder: IOutputFileInfoBuilder;
  constructor(proj: IRmProjFile) {
    this.outputFileInfoBuilder = OutputFileInfoBuilderFactory.getInstance(proj);
  }

  /** Creates Map with the rEnvironmentFile as keys and Output File Info as values */
  createMapForEnvironmentFiles(
    proj: IRmProjFile,
    envFiles: IEnvironmentFile[]
  ): Map<IEnvironmentContent, IOutputFileInfo> {
    const map = new Map<IEnvironmentContent, IOutputFileInfo>();

    const outputCodeDir = path.join(proj.folderPath, StandardFolder.OutputCode);
    const standardOutputFolder = StandardOutputFolder.DotEnvironment;
    const outputContainerFolder = path.join(outputCodeDir, standardOutputFolder);
    const inputContainerFolder = StandardFolder.Config;
    const outputFileExt = Platform.IsWindows() ? ".bat" : ".sh";

    for (let envFile of envFiles) {
      const inputFileName = path.parse(envFile.fileName).name;
      const inputFilePath = path.join(envFile.folderPath, envFile.fileName);
      let inputFileRelPath = inputFilePath.substring(inputContainerFolder.length + 1);
      let outputFileName = `run.${inputFileName}.env${outputFileExt}`;
      let outputFilePath = path.join(outputContainerFolder, outputFileName);
      const outputFileRelPath = outputFilePath.replace(outputCodeDir, "").substring(1);

      const nameInfo: IOutputFileInfo = {
        inputFileName: path.parse(envFile.fileName).name,
        inputFileExt: path.parse(envFile.fileName).ext,
        inputFilePath,
        inputFileRelPath,
        outputFileName,
        outputFilePath,
        outputFileRelPath,
        outputFileCleanName: "",
        outputFileClassName: "",
        outputFileSubNamespace: "",
        outputFileFullNamespace: "",
        isValid: false,
      };
      map.set(envFile.content, nameInfo);
    }

    return map;
  }

  /** Creates Map with the Page as keys and Output File Infor as values */
  createMapForPages(proj: IRmProjFile, pageFiles: IPageFile[]): Map<IPage, IOutputFileInfo> {
    const map = new Map<IPage, IOutputFileInfo>();

    for (let pageFile of pageFiles) {
      const nameInfo = this.outputFileInfoBuilder.build(pageFile, proj);
      map.set(pageFile.content, nameInfo);
    }

    return map;
  }

  /** Creates Map with the TestCase as keys and Output File Infor as values */
  createMapForTestCases(proj: IRmProjFile, testCaseFiles: ITestCaseFile[]): Map<ITestCase, IOutputFileInfo> {
    const map = new Map<ITestCase, IOutputFileInfo>();

    for (let testCaseFile of testCaseFiles) {
      const nameInfo = this.outputFileInfoBuilder.build(testCaseFile, proj);
      map.set(testCaseFile.content, nameInfo);
    }

    return map;
  }

  /** Creates Map with the Test Suite as keys and Output File Infor as values */
  createMapForTestSuites(proj: IRmProjFile, testSuiteFiles: ITestSuiteFile[]): Map<ITestSuite, IOutputFileInfo> {
    const map = new Map<ITestSuite, IOutputFileInfo>();

    for (let testSuiteFile of testSuiteFiles) {
      const nameInfo = this.outputFileInfoBuilder.build(testSuiteFile, proj);
      map.set(testSuiteFile.content, nameInfo);
    }

    return map;
  }

  /** Creates Map with the Test Routine as keys and Output File Infor as values */
  createMapForTestRoutines(
    proj: IRmProjFile,
    testRoutineFiles: ITestRoutineFile[]
  ): Map<ITestRoutine, IOutputFileInfo> {
    const map = new Map<ITestRoutine, IOutputFileInfo>();

    for (let testRoutineFile of testRoutineFiles) {
      const nameInfo = this.outputFileInfoBuilder.build(testRoutineFile, proj);
      map.set(testRoutineFile.content, nameInfo);
    }

    return map;
  }
}
