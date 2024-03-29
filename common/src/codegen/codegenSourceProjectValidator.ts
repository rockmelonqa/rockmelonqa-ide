import {
  ActionType,
  IRoutineStep,
  ISourceProjectMetadata,
  ITestCase,
  ITestRoutineActionStep,
  ITestRoutineFile,
  SourceFileValidationError,
} from "../file-defs";
import { actionValidatorRegistry } from "./codegen-common/action-validator-registry";
import path from "path";
import { ITestCaseFile, ITestCaseStep, ITestCaseActionStep } from "../file-defs/testCaseFile";
import { ITestActionStep } from "../file-defs/shared";

type ErrorInfo = {
  /** Line number: starts at 1 */
  lineNumber: number;
  /** Error message */
  message: string;
  /** Action type */
  actionType?: ActionType;
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

    const testRoutineErrors = this.validateTestRoutines(this.sourceProjMeta.testRoutines);
    allErrors.push(...testRoutineErrors);

    // TODO: Other errors of other source files

    return allErrors;
  }

  /**
   * Validates  an array of testRoutine files
   * @returns {SourceFileValidationError[]} An array of SourceFileValidationError
   */
  private validateTestRoutines(testRoutineFiles: ITestRoutineFile[]): SourceFileValidationError[] {
    let errors: SourceFileValidationError[] = [];
    for (let testRoutineFile of testRoutineFiles) {
      let testcaseErrors = this.validateTestRoutineSteps(testRoutineFile.content.steps);

      errors.push(
        ...testcaseErrors.map((errorInfo) => {
          return new SourceFileValidationError(
            testRoutineFile.fileName,
            path.join(testRoutineFile.folderPath, testRoutineFile.fileName),
            errorInfo.lineNumber,
            errorInfo.message,
            errorInfo.actionType
          );
        })
      );
    }
    return errors;
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
            errorInfo.message,
            errorInfo.actionType
          );
        })
      );
    }
    return errors;
  }

  /** Validates an array routine steps */
  private validateTestRoutineSteps(steps: IRoutineStep[]): ErrorInfo[] {
    let errors: ErrorInfo[] = [];

    for (let [index, step] of steps.entries()) {
      if (!(step.type === "testStep")) {
        continue;
      }

      if (!step.action) {
        errors.push({ lineNumber: index + 1, message: `Missing "Action"` });
        continue;
      }

      let errorMessage = this.validateActionTestStep(step);
      if (errorMessage) {
        const actionType = step.action! as unknown as ActionType;
        errors.push({ lineNumber: index + 1, message: errorMessage, actionType: actionType });
      }
    }

    return errors;
  }

  /**
   * Validates the steps in a testcase
   * @returns {ErrorInfo[]} An array of Error Info
   */
  private validateTestSteps(steps: ITestCaseStep[]): ErrorInfo[] {
    let errors: ErrorInfo[] = [];

    for (let [index, step] of steps.entries()) {
      if (!(step.type === "testStep")) {
        continue;
      }

      if (!step.action) {
        errors.push({ lineNumber: index + 1, message: `Missing "Action"` });
        continue;
      }

      let errorMessage = this.validateActionTestStep(step);
      if (errorMessage) {
        const actionType = step.action! as unknown as ActionType;
        errors.push({ lineNumber: index + 1, message: errorMessage, actionType: actionType });
      }
    }

    return errors;
  }

  /**
   * Validates a single action testStep item
   * @returns {string|undefined} The error message TEMPLATE string or `undefined` if there is no error.
   */
  private validateActionTestStep(step: ITestActionStep): string | undefined {
    const actionType = step.action! as unknown as ActionType;
    const actionValidator = actionValidatorRegistry.get(actionType);

    if (!actionValidator) {
      throw new Error("DEV ERROR: Cannot find validator for action: " + actionType);
    }

    const errorMessage = actionValidator(step);
    return errorMessage;
  }
}
