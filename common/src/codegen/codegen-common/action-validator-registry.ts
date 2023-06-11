import { ActionType } from "../../file-defs";
import { ITestStepRegular } from "../../file-defs/testCaseFile";
import { IActionTemplateParam } from "../types";
import clear from "./action-validators/clear";
import click from "./action-validators/click";
import clickPopup from "./action-validators/clickPopup";
import closePopup from "./action-validators/closePopup";
import delay from "./action-validators/delay";
import gotoUrl from "./action-validators/gotoUrl";
import input from "./action-validators/input";
import inputByCode from "./action-validators/inputByCode";
import runCode from "./action-validators/runCode";
import selectOption from "./action-validators/selectOption";
import verifyAttribute from "./action-validators/verifyAttribute";
import verifyHasText from "./action-validators/verifyHasText";
import verifyHasValue from "./action-validators/verifyHasValue";
import verifyIsEditable from "./action-validators/verifyIsEditable";
import verifyIsHidden from "./action-validators/verifyIsHidden";
import verifyIsReadOnly from "./action-validators/verifyIsReadOnly";
import verifyIsVisible from "./action-validators/verifyIsVisible";
import verifyTitle from "./action-validators/verifyTitle";
import verifyTitleContains from "./action-validators/verifyTitleContains";
import verifyUrl from "./action-validators/verifyUrl";

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
