import { ActionDataType, IActionTemplateParam } from "../../types";
import { createEnvironmentVariableString, escapeStr, getParameters } from "../../utils/stringUtils";

/** Generates Csharp code for action SelectOption */
export default (params: IActionTemplateParam) => {
  const index = parseInt(String(params.data.rawData));
  const data = isNaN(index) ? `"${escapeStr(params.data.rawData)}"` : index;
  return `await this.PageTest.SwitchTabAsync(${data});`;
};
