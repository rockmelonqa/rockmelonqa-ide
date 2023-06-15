import { ActionDataType, IActionTemplateParam } from "../../types";
import { createEenvironmentVariableString, escapeStr } from "../../utils/stringUtils";

/** Generates Csharp code for action GotoUrl */
export default (params: IActionTemplateParam) => {
  const data =
    params.data.dataType === ActionDataType.LiteralValue
      ? `"${String(params.data.rawData)}"`
      : createEenvironmentVariableString(String(params.data.rawData));
  return `await Page.GotoAsync(${data});`;
};
