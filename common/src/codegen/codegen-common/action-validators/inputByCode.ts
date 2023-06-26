import { ITestCaseActionStep } from "../../../file-defs/testCaseFile";
import { validateStepRequirePageAndElementAndData } from "../action-validator-registry";

/** Validate step with action Input By code */
export default (step: ITestCaseActionStep) => {
  return validateStepRequirePageAndElementAndData(step);
};
