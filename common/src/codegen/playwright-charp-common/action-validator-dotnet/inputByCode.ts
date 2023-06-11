import { ITestStepRegular } from "../../../file-defs/testCaseFile";
import { validateStepRequirePageAndElementAndData } from "../action-validator-registry-dotnet";

/** Validate step with action Input By code */
export default (step: ITestStepRegular) => {
  return validateStepRequirePageAndElementAndData(step);
};
