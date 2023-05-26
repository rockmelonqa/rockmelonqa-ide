import { ActionType } from "../../file-defs";
import { IActionTemplateParam } from "../types";
import clear from "./routine-action-generators/clear";
import click from "./routine-action-generators/click";
import clickPopup from "./routine-action-generators/clickPopup";
import closePopup from "./routine-action-generators/closePopup";
import delay from "./routine-action-generators/delay";
import gotoUrl from "./routine-action-generators/gotoUrl";
import input from "./routine-action-generators/input";
import inputByCode from "./routine-action-generators/inputByCode";
import runCode from "./routine-action-generators/runCode";
import selectOption from "./routine-action-generators/selectOption";
import verifyAttribute from "./routine-action-generators/verifyAttribute";
import verifyHasText from "./routine-action-generators/verifyHasText";
import verifyHasValue from "./routine-action-generators/verifyHasValue";
import verifyIsEditable from "./routine-action-generators/verifyIsEditable";
import verifyIsHidden from "./routine-action-generators/verifyIsHidden";
import verifyIsReadOnly from "./routine-action-generators/verifyIsReadOnly";
import verifyIsVisible from "./routine-action-generators/verifyIsVisible";
import verifyTitle from "./routine-action-generators/verifyTitle";
import verifyTitleContains from "./routine-action-generators/verifyTitleContains";
import verifyUrl from "./routine-action-generators/verifyUrl";

export const routineActionRegistry = new Map<ActionType, (params: IActionTemplateParam) => string>();

routineActionRegistry
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
