import { ActionType } from "../../file-defs";
import { IActionTemplateParam } from "../types";
import clear from "./action-generator-dotnet/clear";
import click from "./action-generator-dotnet/click";
import clickPopup from "./action-generator-dotnet/clickPopup";
import closePopup from "./action-generator-dotnet/closePopup";
import dblClick from "./action-generator-dotnet/dblClick";
import delay from "./action-generator-dotnet/delay";
import gotoUrl from "./action-generator-dotnet/gotoUrl";
import input from "./action-generator-dotnet/input";
import inputByCode from "./action-generator-dotnet/inputByCode";
import runCode from "./action-generator-dotnet/runCode";
import selectOption from "./action-generator-dotnet/selectOption";
import verifyAttribute from "./action-generator-dotnet/verifyAttribute";
import verifyHasText from "./action-generator-dotnet/verifyHasText";
import verifyHasValue from "./action-generator-dotnet/verifyHasValue";
import verifyIsEditable from "./action-generator-dotnet/verifyIsEditable";
import verifyIsHidden from "./action-generator-dotnet/verifyIsHidden";
import verifyIsReadOnly from "./action-generator-dotnet/verifyIsReadOnly";
import verifyIsVisible from "./action-generator-dotnet/verifyIsVisible";
import verifyTitle from "./action-generator-dotnet/verifyTitle";
import verifyTitleContains from "./action-generator-dotnet/verifyTitleContains";
import verifyUrl from "./action-generator-dotnet/verifyUrl";

/** Contains a map from ActionType of a GenrateAction function */
export const actionRegistyDotnet = new Map<ActionType, (params: IActionTemplateParam) => string>();

actionRegistyDotnet
  .set(ActionType.Clear, clear)
  .set(ActionType.Click, click)
  .set(ActionType.ClickPopup, clickPopup)
  .set(ActionType.ClosePopup, closePopup)
  .set(ActionType.Delay, delay)
  .set(ActionType.DblClick, dblClick)
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
