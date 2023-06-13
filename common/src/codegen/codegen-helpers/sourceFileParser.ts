import path from "path";
import fs from "fs";
import { IPage, IPageFile } from "../../file-defs/pageFile";
import parseContent from "./parseContent";
import { v4 as uuidv4 } from "uuid";
import { ITestCase, ITestCaseFile, ITestRoutine, ITestRoutineFile, ITestSuite, ITestSuiteFile } from "../../file-defs";
import { IConfiguration, IConfigurationFile } from "../../file-defs/configFile";

export class SourceFileParser {
  public static async parseConfiguration(parentDir: string, fileRelPath: string): Promise<IConfigurationFile> {
    let filePath = path.join(parentDir, fileRelPath);
    let fileContent = fs.readFileSync(filePath, "utf-8");
    let [configuration, isValid] = parseContent<IConfiguration>(fileContent);

    // Provide an empty elements array so that codegen can generate a setting class with no property
    if (!isValid) {
      configuration.settings = [];
    }

    return {
      content: configuration,
      fileName: path.basename(filePath),
      folderPath: path.dirname(filePath),
      isValid,
    };
  }

  public static async parsePageDefinition(parentDir: string, fileRelPath: string): Promise<IPageFile> {
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
  }

  public static async parseTestCase(parentDir: string, fileRelPath: string): Promise<ITestCaseFile> {
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
  }

  public static async parseTestRoutine(parentDir: string, fileRelPath: string): Promise<ITestRoutineFile> {
    let filePath = path.join(parentDir, fileRelPath);
    let fileContent = fs.readFileSync(filePath, "utf-8");
    let [routine, isValid] = parseContent<ITestRoutine>(fileContent);

    // Provide an empty steps array so that codegen can generate a Routine class with no step
    if (!isValid) {
      routine.id = uuidv4();
      routine.steps = [];
    }

    return {
      content: routine,
      fileName: path.basename(filePath),
      folderPath: path.dirname(filePath),
      isValid,
    };
  }

  public static async parseTestSuite(parentDir: string, fileRelPath: string): Promise<ITestSuiteFile> {
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
  }
}
