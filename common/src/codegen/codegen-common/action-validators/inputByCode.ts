import { ITestActionStep } from "../../../file-defs/shared";
import { StepValidator } from "../action-validator-registry";

/** Validate step with action Input By code */
export default (step: ITestActionStep) => {
  return StepValidator.validateRequirePageAndElementAndData(step);
};
