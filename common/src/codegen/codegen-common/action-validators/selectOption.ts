import { ITestActionStep } from "../../../file-defs/shared";
import { StepValidator } from "../action-validator-registry";

/** Validate step with action Select Option */
export default (step: ITestActionStep) => {
  return StepValidator.validateRequirePageAndElement(step);
};
