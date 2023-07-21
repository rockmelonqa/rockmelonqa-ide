import { ITestActionStep } from "../../../file-defs/shared";
import { StepValidator } from "../action-validator-registry";

/** Validate step with action Verify Attribte */
export default (step: ITestActionStep) => {
  return StepValidator.validateRequirePageAndElementAndData(step);
};
