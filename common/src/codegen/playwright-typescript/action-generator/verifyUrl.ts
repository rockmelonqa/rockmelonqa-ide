import { ActionDataType, IActionTemplateParam } from "../../types";
import { createEnvironmentVariableString, escapeStr } from "../../utils/stringUtils";

/** Generates Csharp code for action Verify Url */
export default (params: IActionTemplateParam) => {
  const data =
    params.data.dataType === ActionDataType.LiteralValue
      ? `"${escapeStr(String(params.data.rawData))}"`
      : createEnvironmentVariableString(String(params.data.rawData));
  return `await expect(this.page).toHaveURL(${data});`;
};
