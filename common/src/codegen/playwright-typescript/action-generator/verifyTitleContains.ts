import { ActionDataType, IActionTemplateParam } from "../../types";
import { createEenvironmentVariableString, escapeStr } from "../../utils/stringUtils";

/** Generates Csharp code for action Verify TitleContains */
export default (params: IActionTemplateParam) => {
  const data =
    params.data.dataType === ActionDataType.LiteralValue
      ? `"${escapeStr(String(params.data.rawData))}"`
      : createEenvironmentVariableString(String(params.data.rawData));

  return `await expect(this.page).toHaveTitle(new RegExp(${data}));`;
};
