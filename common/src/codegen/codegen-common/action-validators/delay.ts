import { ITestCaseActionStep } from "../../../file-defs/testCaseFile";
import { validateStepRequireData } from "../action-validator-registry";

/** Validate step with action Delay */
export default (step: ITestCaseActionStep) => {
  return validateStepRequireData(step);
};
