import { ITestActionStep } from "../../../file-defs/shared";
import { StepValidator } from "../action-validator-registry";

/** Validate step with action Verify Title Contains */
export default (step: ITestActionStep) => {
  return StepValidator.validateRequireDataAsString(step);
};
