import { ITestStepCaseStep } from "../../../file-defs/testCaseFile";
import { validateStepRequirePageAndElementAndData } from "../action-validator-registry";

/** Validate step with action Clear */
export default (step: ITestStepCaseStep) => {
  return validateStepRequirePageAndElementAndData(step);
};
