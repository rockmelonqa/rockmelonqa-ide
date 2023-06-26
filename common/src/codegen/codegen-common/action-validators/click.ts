import { ITestCaseActionStep } from "../../../file-defs/testCaseFile";
import { validateStepRequirePageAndElement } from "../action-validator-registry";

/** Validate step with action Click */
export default (step: ITestCaseActionStep) => {
  return validateStepRequirePageAndElement(step);
};
