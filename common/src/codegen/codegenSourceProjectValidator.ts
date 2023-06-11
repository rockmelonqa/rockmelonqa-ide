import { ActionType, ISourceProjectMetadata, ITestCase } from "../file-defs";
import { actionValidatorRegistryDotnet } from "./codegen-common/action-validator-registry";
import { SourceFileValidationError } from "./types";
import path from "path";
import { ITestCaseFile, ITestStep } from "../file-defs/testCaseFile";

type ErrorInfo = {
  /** Line number: starts at 1 */
  lineNumber: number;
  /** Error message */
  message: string;
};

/** Validator for source project files */
export class CodegenSourceProjectValidator {
  /** The Source Project Meta being validated */
  private sourceProjMeta: ISourceProjectMetadata;

  constructor(sourceProjMeta: ISourceProjectMetadata) {
    this.sourceProjMeta = sourceProjMeta;
  }

  /** Performs the validations
   * @returns {SourceFileValidationError[]} An array of ALL validation error messages
   */
  public validate(): SourceFileValidationError[] {
    const allErrors: SourceFileValidationError[] = [];

    const testCaseErrors = this.validateTestCases(this.sourceProjMeta.testCases);
    allErrors.push(...testCaseErrors);

    // TODO: Other errors of other source files

    return allErrors;
  }

  /**
   * Validates  an array of testCaseFile
   * @returns {SourceFileValidationError[]} An array of SourceFileValidationError
   */
  private validateTestCases(testcaseFiles: ITestCaseFile[]): SourceFileValidationError[] {
    let errors: SourceFileValidationError[] = [];
    for (let testcaseFile of testcaseFiles) {
      let testcaseErrors = this.validateTestSteps(testcaseFile.content.steps);

      errors.push(
        ...testcaseErrors.map((errorInfo) => {
          return new SourceFileValidationError(
            testcaseFile.fileName,
            path.join(testcaseFile.folderPath, testcaseFile.fileName),
            errorInfo.lineNumber,
            errorInfo.message
          );
        })
      );
    }
    return errors;
  }

  /**
   * Validates the steps in a testcase
   * @returns {ErrorInfo[]} An array of Error Info
   */
  private validateTestSteps(steps: ITestStep[]): ErrorInfo[] {
    let errors: ErrorInfo[] = [];

    for (let [index, step] of steps.entries()) {
      let errorMessage = this.validateTestStep(step);
      if (errorMessage) {
        errors.push({ lineNumber: index + 1, message: errorMessage });
      }
    }

    return errors;
  }

  /**
   * Validates a single testStep item
   * @returns {string|undefined} The error message string or `undefined` if there is no error.
   */
  private validateTestStep(step: ITestStep): string | undefined {
    if (!(step.type === "testStep")) {
      return undefined;
    }

    if (!step.action) {
      return `Missing "Action"`;
    }

    const actionType = step.action! as unknown as ActionType;
    const actionValidator = actionValidatorRegistryDotnet.get(actionType);

    if (!actionValidator) {
      throw new Error("DEV ERROR: Cannot find validator for action: " + actionType);
    }

    const errorMessage = actionValidator(step);
    return errorMessage;
  }
}
