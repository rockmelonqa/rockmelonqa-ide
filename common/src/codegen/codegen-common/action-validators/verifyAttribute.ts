import { ITestCaseActionStep } from "../../../file-defs/testCaseFile";
import { validateStepRequirePageAndElementAndData } from "../action-validator-registry";

/** Validate step with action Clear */
export default (step: ITestCaseActionStep) => {
  return validateStepRequirePageAndElementAndData(step);
};
