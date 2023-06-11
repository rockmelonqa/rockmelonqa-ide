import { ITestStepRegular } from "../../../file-defs/testCaseFile";
import { validateStepRequirePageAndElementAndData } from "../action-validator-registry";

/** Validate step with action Clear */
export default (step: ITestStepRegular) => {
  return validateStepRequirePageAndElementAndData(step);
};
