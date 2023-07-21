import { ITestActionStep } from "../../../file-defs/shared";
import { StepValidator } from "../action-validator-registry";

/** Validate step with action Verify URL */
export default (step: ITestActionStep) => {
  return StepValidator.validateRequireData(step);
};
