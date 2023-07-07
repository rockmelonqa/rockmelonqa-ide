import { ActionDataType, IActionTemplateParam } from "../../types";
import { createEnvironmentVariableString, escapeStr, getParameters } from "../../utils/stringUtils";

/** Generates Csharp code for action SelectOption */
export default (params: IActionTemplateParam) => {
  const { pageName, elementName, parameters } = params;

  const data =
    params.data.dataType === ActionDataType.LiteralValue
      ? `"${escapeStr(String(params.data.rawData))}"`
      : createEnvironmentVariableString(String(params.data.rawData));

  return `await defs.${pageName}.${elementName}(${getParameters(parameters)}).SelectOptionAsync(${data});`;
};
