import { ITestStepRegular } from "../../../file-defs/testCaseFile";
import { validateStepRequireData } from "../action-validator-registry-dotnet";

/** Validate step with action Goto Url */
export default (step: ITestStepRegular) => {
  return validateStepRequireData(step);
};
