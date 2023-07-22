import { ActionDataType, IActionTemplateParam } from "../../types";
import { createEnvironmentVariableString } from "../../utils/stringUtils";

/** Generates Csharp code for action Delay */
export default (params: IActionTemplateParam) => {
  const envVarString = createEnvironmentVariableString(String(params.data.rawData));
  const data =
    params.data.dataType === ActionDataType.LiteralValue
      ? parseInt(String(params.data.rawData)) || 0
      : `Int32.Parse(string.IsNullOrEmpty(${envVarString}) ? "0" : ${envVarString})`;
  return `await Task.Delay(${data});`;
};
