import { ITestActionStep } from "../../../file-defs/shared";
import { StepValidator } from "../action-validator-registry";

/** Validate step with action SwitchTab */
export default (step: ITestActionStep) => {
  return StepValidator.validateRequireData(step);
};
