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
  data: string;
  parameters?: string[];
}

/** A comment item in a test case or a test routine, type ="comment"*/
export interface ITestStepComment extends Omit<ITestStepBase, "type"> {
  type: "comment";
  comment?: string;
}
