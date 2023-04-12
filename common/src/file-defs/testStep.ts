export interface ITestStep {
  /** ID of current step */
  id: string;
  type: "testStep" | "comment";
  /** ID of the page */
  page?: string;
  /** ID of the element */
  element?: string;
  action?: string;
  data?: string;
  parameters?: string[];
  comment?: string;
}
