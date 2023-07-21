import { ITestActionStep } from "../../../file-defs/shared";
import { StepValidator } from "../action-validator-registry";

/** Validate step with action Run Code */
export default (step: ITestActionStep) => {
  return StepValidator.validateRequireData(step);
};
