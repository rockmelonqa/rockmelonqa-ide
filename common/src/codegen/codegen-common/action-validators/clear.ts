import { ITestStepRegular } from "../../../file-defs/testCaseFile";
import { validateStepRequirePageAndElement } from "../action-validator-registry";

/** Validate step with action Clear */
export default (step: ITestStepRegular) => {
  return validateStepRequirePageAndElement(step);
};
