export interface IDictionary<T> {
  [Key: string]: T;
}

export interface ITestStepBase {
  id: string;
  type: "";
}

export interface ITestStepComment extends Omit<ITestStepBase, "type"> {
  type: "comment";
  comment?: string;
}
