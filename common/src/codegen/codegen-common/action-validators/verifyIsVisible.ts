import { ITestStepCaseStep } from "../../../file-defs/testCaseFile";
import { validateStepRequirePageAndElement } from "../action-validator-registry";

/** Validate step with action Clear */
export default (step: ITestStepCaseStep) => {
  return validateStepRequirePageAndElement(step);
};
