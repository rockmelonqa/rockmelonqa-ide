import { ITestActionStep } from "../../../file-defs/shared";
import { StepValidator } from "../action-validator-registry";

/** Validate step with action Input */
export default (step: ITestActionStep) => {
  return StepValidator.validateRequirePageAndElement(step);
};
