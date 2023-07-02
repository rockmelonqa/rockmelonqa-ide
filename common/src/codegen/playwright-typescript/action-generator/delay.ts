import { StandardOutputFile } from "../../../file-defs";
import { ActionDataType, IActionData, IActionTemplateParam } from "../../types";
import { createEenvironmentVariableString, escapeStr } from "../../utils/stringUtils";

/** Generates Csharp code for action Delay */
export default (params: IActionTemplateParam) => {
  const data =
    params.data.dataType === ActionDataType.LiteralValue
      ? parseInt(String(params.data.rawData)) || 0
      : `Int32.Parse(${createEenvironmentVariableString(String(params.data.rawData))})`;
  return `await this.delay(${data});`;
};
