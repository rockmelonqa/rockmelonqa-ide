import { ActionType } from "../../file-defs";
import { IActionTemplateParam } from "../types";
import clear from "./action-generator/clear";
import click from "./action-generator/click";
import clickPopup from "./action-generator/clickPopup";
import closePopup from "./action-generator/closePopup";
import delay from "./action-generator/delay";
import gotoUrl from "./action-generator/gotoUrl";
import input from "./action-generator/input";
import inputByCode from "./action-generator/inputByCode";
import selectOption from "./action-generator/selectOption";
import verifyAttribute from "./action-generator/verifyAttribute";
import verifyHasText from "./action-generator/verifyHasText";
import verifyHasValue from "./action-generator/verifyHasValue";
import verifyIsHidden from "./action-generator/verifyIsHidden";
import verifyTitle from "./action-generator/verifyTitle";
import verifyTitleContains from "./action-generator/verifyTitleContains";
import verifyUrl from "./action-generator/verifyUrl";

export const actionRegisty = new Map<ActionType, (params: IActionTemplateParam) => string>();

actionRegisty
  .set(ActionType.Clear, clear)
  .set(ActionType.Click, click)
  .set(ActionType.ClickPopup, clickPopup)
  .set(ActionType.ClosePopup, closePopup)
  .set(ActionType.Delay, delay)
  .set(ActionType.GoToUrl, gotoUrl)
  .set(ActionType.Input, input)
  .set(ActionType.InputByCode, inputByCode)
  //.set(ActionType.Run, run)
  .set(ActionType.SelectOption, selectOption)
  .set(ActionType.VerifyAttribute, verifyAttribute)
  .set(ActionType.VerifyHasText, verifyHasText)
  .set(ActionType.VerifyHasValue, verifyHasValue)
  .set(ActionType.VerifyIsHidden, verifyIsHidden)
  .set(ActionType.VerifyTitle, verifyTitle)
  .set(ActionType.VerifyTitleContains, verifyTitleContains)
  .set(ActionType.VerifyUrl, verifyUrl);
