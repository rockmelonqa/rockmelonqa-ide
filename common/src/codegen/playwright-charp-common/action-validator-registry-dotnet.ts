import { ITestStepRegular } from "rockmelonqa.common/file-defs/testCaseFile";
import { ActionType } from "../../file-defs";
import { IActionTemplateParam } from "../types";
import clear from "./action-validator-dotnet/clear";
import click from "./action-validator-dotnet/click";
import clickPopup from "./action-validator-dotnet/clickPopup";
import closePopup from "./action-validator-dotnet/closePopup";
import delay from "./action-validator-dotnet/delay";
import gotoUrl from "./action-validator-dotnet/gotoUrl";
import input from "./action-validator-dotnet/input";
import inputByCode from "./action-validator-dotnet/inputByCode";
import runCode from "./action-validator-dotnet/runCode";
import selectOption from "./action-validator-dotnet/selectOption";
import verifyAttribute from "./action-validator-dotnet/verifyAttribute";
import verifyHasText from "./action-validator-dotnet/verifyHasText";
import verifyHasValue from "./action-validator-dotnet/verifyHasValue";
import verifyIsEditable from "./action-validator-dotnet/verifyIsEditable";
import verifyIsHidden from "./action-validator-dotnet/verifyIsHidden";
import verifyIsReadOnly from "./action-validator-dotnet/verifyIsReadOnly";
import verifyIsVisible from "./action-validator-dotnet/verifyIsVisible";
import verifyTitle from "./action-validator-dotnet/verifyTitle";
import verifyTitleContains from "./action-validator-dotnet/verifyTitleContains";
import verifyUrl from "./action-validator-dotnet/verifyUrl";

/** A registry (map) of step validator for each ActionType */
export const actionValidatorRegistryDotnet = new Map<ActionType, (step: ITestStepRegular) => string | undefined>();

actionValidatorRegistryDotnet
  .set(ActionType.Clear, clear)
  .set(ActionType.Click, click)
  .set(ActionType.ClickPopup, clickPopup)
  .set(ActionType.ClosePopup, closePopup)
  .set(ActionType.Delay, delay)
  .set(ActionType.GoToUrl, gotoUrl)
  .set(ActionType.Input, input)
  .set(ActionType.InputByCode, inputByCode)
  //.set(ActionType.Run, run)
  .set(ActionType.RunCode, runCode)
  .set(ActionType.SelectOption, selectOption)
  .set(ActionType.VerifyAttribute, verifyAttribute)
  .set(ActionType.VerifyHasText, verifyHasText)
  .set(ActionType.VerifyHasValue, verifyHasValue)
  .set(ActionType.VerifyIsEditable, verifyIsEditable)
  .set(ActionType.VerifyIsReadOnly, verifyIsReadOnly)
  .set(ActionType.VerifyIsHidden, verifyIsHidden)
  .set(ActionType.VerifyIsVisible, verifyIsVisible)
  .set(ActionType.VerifyTitle, verifyTitle)
  .set(ActionType.VerifyTitleContains, verifyTitleContains)
  .set(ActionType.VerifyUrl, verifyUrl);

/**
 * Validates a testStep that requires "Page" and "Element" and "Data"
 * @return {string} The message to indicate the missing values. Empty string if the testStep is valid.
 */
export const validateStepRequirePageAndElementAndData = (step: ITestStepRegular): string => {
  if (!step.page && !step.element) {
    return `Action "${step.action}" is missing "Page" and "Element"`;
  }
  if (step.page && !step.element) {
    return `Action "${step.action}" is missing "Element"`;
  }

  if (step.page && step.element && !step.data) {
    return `Action "${step.action}" is missing "Data"`;
  }

  return ``;
};

/**
 * Validates a testStep that requires "Page" and "Element"
 * @return {string} The message to indicate the missing values. Empty string if the testStep is valid.
 */
export const validateStepRequirePageAndElement = (step: ITestStepRegular): string => {
  if (!step.page && !step.element) {
    return `Action "${step.action}" is missing "Page" and "Element"`;
  }
  if (step.page && !step.element) {
    return `Action "${step.action}" is missing "Element"`;
  }

  // The UI should have prevented user from selecting an element before selecting a page

  return ``;
};

/**
 * Validates a testStep that requires "Data"
 * @return {string} The message to indicate the missing values. Empty string if the testStep is valid.
 * */
export const validateStepRequireData = (step: ITestStepRegular): string => {
  return step.data ? "" : `Action "${step.action}" is missing "data"`;
};
