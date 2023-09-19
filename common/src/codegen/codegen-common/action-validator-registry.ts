import { ActionType, ITestRoutineActionStep } from "../../file-defs";
import { ITestActionStep } from "../../file-defs/shared";
import { ITestCaseActionStep } from "../../file-defs/testCaseFile";
import { IActionTemplateParam } from "../types";
import addComment from "./action-validators/addComment";
import clear from "./action-validators/clear";
import click from "./action-validators/click";
import clickPopup from "./action-validators/clickPopup";
import closePopup from "./action-validators/closePopup";
import dblClick from "./action-validators/dblClick";
import delay from "./action-validators/delay";
import gotoUrl from "./action-validators/gotoUrl";
import input from "./action-validators/input";
import inputByCode from "./action-validators/inputByCode";
import runCode from "./action-validators/runCode";
import runTestRoutine from "./action-validators/runTestRoutine";
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
export const actionValidatorRegistry = new Map<ActionType, (step: ITestActionStep) => string | undefined>();

actionValidatorRegistry
  .set(ActionType.AddComment, addComment)
  .set(ActionType.Clear, clear)
  .set(ActionType.Click, click)
  .set(ActionType.ClickPopup, clickPopup)
  .set(ActionType.ClosePopup, closePopup)
  .set(ActionType.Delay, delay)
  .set(ActionType.DblClick, dblClick)
  .set(ActionType.GoToUrl, gotoUrl)
  .set(ActionType.Input, input)
  .set(ActionType.InputByCode, inputByCode)
  .set(ActionType.RunCode, runCode)
  .set(ActionType.RunTestRoutine, runTestRoutine)
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

class TestCaseStepValidator {
  /**
   * Validates a testStep that requires "Page" and "Element" and "Data"
   * @return {string} The message TEMPLATE to indicate the missing values. Empty string if the testStep is valid.
   */
  static validateRequirePageAndElementAndData(step: ITestCaseActionStep): string {
    if (!step.page && !step.element) {
      return `Action "{{${step.action}}}" is missing "Page" and "Element"`;
    }
    if (step.page && !step.element) {
      return `Action "{{${step.action}}}" is missing "Element"`;
    }

    if (step.page && step.element && !step.data) {
      return `Action "{{${step.action}}}" is missing "Data"`;
    }

    return ``;
  }
  /**
   * Validates a testStep that requires "Page" and "Element"
   * @return {string} The message TEMPLATE to indicate the missing values. Empty string if the testStep is valid.
   */
  static validateRequirePageAndElement(step: ITestCaseActionStep): string {
    if (!step.page && !step.element) {
      return `Action "{{${step.action}}}" is missing "Page" and "Element"`;
    }
    if (step.page && !step.element) {
      return `Action "{{${step.action}}}" is missing "Element"`;
    }

    // The UI should have prevented user from selecting an element before selecting a page

    return ``;
  }

  /**
   * Validates a testStep that requires "Data"
   * @return {string} The message TEMPLATE to indicate the missing values. Empty string if the testStep is valid.
   * */
  static validateRequireData(step: ITestCaseActionStep): string {
    return step.data ? "" : `Action "{{${step.action}}}" is missing "Data"`;
  }

  /**
   * Validates a testStep that requires "Data" as string
   * @return {string} The message TEMPLATE to indicate the missing values. Empty string if the testStep is valid.
   * */
  static validateRequireDataAsString(step: ITestCaseActionStep): string {
    return typeof step.data === "string" ? "" : `Action "{{${step.action}}}" is missing "Data"`;
  }
}

class TestRoutineStepValidator {
  /**
   * Validates a testStep that requires "Page" and "Element" and "Data"
   * @return {string} The message TEMPLATE to indicate the missing values. Empty string if the testStep is valid.
   */
  static validateRequirePageAndElementAndData(step: ITestRoutineActionStep): string {
    if (!step.page && !step.element) {
      return `Action "{{${step.action}}}" is missing "Page" and "Element"`;
    }
    if (step.page && !step.element) {
      return `Action "{{${step.action}}}" is missing "Element"`;
    }

    if (step.page && step.element && !step.data) {
      return `Action "{{${step.action}}}" is missing "Data" object`;
    }

    for (const [dsKey, value] of Object.entries(step.data)) {
      if (!value) {
        return `Action "{{${step.action}}}" is missing "Data" for one of the datasets`;
      }
    }

    return ``;
  }
  /**
   * Validates a testStep that requires "Page" and "Element"
   * @return {string} The message TEMPLATE to indicate the missing values. Empty string if the testStep is valid.
   */
  static validateRequirePageAndElement(step: ITestRoutineActionStep): string {
    if (!step.page && !step.element) {
      return `Action "{{${step.action}}}" is missing "Page" and "Element"`;
    }
    if (step.page && !step.element) {
      return `Action "{{${step.action}}}" is missing "Element"`;
    }

    // The UI should have prevented user from selecting an element before selecting a page

    return ``;
  }

  /**
   * Validates a testStep that requires "Data"
   * @return {string} The message TEMPLATE to indicate the missing values. Empty string if the testStep is valid.
   * */
  static validateRequireData(step: ITestRoutineActionStep): string {
    if (!step.data) {
      return `Action "{{${step.action}}}" is missing "Data"`;
    }

    for (const [dsKey, value] of Object.entries(step.data)) {
      if (!value) {
        return `Action "{{${step.action}}}" is missing "Data" for one or more of the datasets`;
      }
    }

    return "";
  }

  /**
   * Validates a testStep that requires "Data" as string
   * @return {string} The message TEMPLATE to indicate the missing values. Empty string if the testStep is valid.
   * */
  static validateRequireDataAsString(step: ITestRoutineActionStep): string {
    if (!step.data) {
      return `Action "{{${step.action}}}" is missing "Data"`;
    }

    for (const [dsKey, value] of Object.entries(step.data)) {
      if (typeof value !== "string") {
        return `Action "{{${step.action}}}" is missing "Data" for one or more of the datasets`;
      }
    }

    return "";
  }
}

export class StepValidator {
  /**
   *
   */
  constructor() {}

  /**
   * Validates a testStep that requires "Page" and "Element" and "Data"
   * @return {string} The message TEMPLATE to indicate the missing values. Empty string if the testStep is valid.
   */
  static validateRequirePageAndElementAndData = (step: ITestActionStep): string => {
    if (typeof step.data === "string") {
      return TestCaseStepValidator.validateRequirePageAndElementAndData(step as ITestCaseActionStep);
    }
    return TestRoutineStepValidator.validateRequirePageAndElementAndData(step as ITestRoutineActionStep);
  };

  /**
   * Validates a testStep that requires "Page" and "Element"
   * @return {string} The message TEMPLATE to indicate the missing values. Empty string if the testStep is valid.
   */
  static validateRequirePageAndElement = (step: ITestActionStep): string => {
    if (typeof step.data === "string") {
      return TestCaseStepValidator.validateRequirePageAndElement(step as ITestCaseActionStep);
    }
    return TestRoutineStepValidator.validateRequirePageAndElement(step as ITestRoutineActionStep);
  };

  /**
   * Validates a testStep that requires "Data"
   * @return {string} The message TEMPLATE to indicate the missing values. Empty string if the testStep is valid.
   * */
  static validateRequireData = (step: ITestActionStep): string => {
    if (typeof step.data === "string") {
      return TestCaseStepValidator.validateRequireData(step as ITestCaseActionStep);
    }
    return TestRoutineStepValidator.validateRequireData(step as ITestRoutineActionStep);
  };

  /**
   * Validates a testStep that requires "Data" is a string, including empty string
   * @return {string} The message TEMPLATE to indicate the missing values. Empty string if the testStep is valid.
   * */
  static validateRequireDataAsString = (step: ITestActionStep): string => {
    if (typeof step.data === "string") {
      return TestCaseStepValidator.validateRequireDataAsString(step as ITestCaseActionStep);
    }
    return TestRoutineStepValidator.validateRequireDataAsString(step as ITestRoutineActionStep);
  };
}
