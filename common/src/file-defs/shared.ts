import { ActionType } from "./actionType";
import { Indent } from "./rmProjFile";

/** Simple dictionary with key of string an value of type T */
export interface IDictionary<T> {
  [Key: string]: T;
}

/** Base type of a step item */
export interface ITestStepBase {
  id: string;
  type: string;
}

/** An action step in a test case or a test routine, type ="testStep"*/
export interface ITestActionStep extends Omit<ITestStepBase, "type"> {
  type: "testStep";
  page?: string;
  element?: string;
  action?: string;
  data: string | { [datasetId: string]: string };
  parameters?: string[];
}

/** A comment item in a test case or a test routine, type ="comment"*/
export interface ITestStepComment extends Omit<ITestStepBase, "type"> {
  type: "comment";
  comment?: string;
}

/** Map from `Indent` to actual character of that `Indent` */
export const indentCharMap = new Map<Indent, string>([
  [Indent.Tabs, "\t"],
  [Indent.Spaces, " "],
]);

export class SourceFileValidationError {
  /** Name of the file */
  readonly fileName: string;
  /** Full path of the file */
  readonly filePath: string;
  /** Line number (i.e step index) of the error step */
  readonly lineNumber: number;
  /** Error message TEMPLATE, which might contain placeholders for filling with StringRes */
  readonly message: string;
  /** Action type */
  readonly actionType?: ActionType;
  /**
   *
   */
  constructor(fileName: string, filePath: string, lineNumber: number, message: string, actionType?: ActionType) {
    this.fileName = fileName;
    this.filePath = filePath;
    this.lineNumber = lineNumber;
    this.message = message;
    this.actionType = actionType;
  }
}
