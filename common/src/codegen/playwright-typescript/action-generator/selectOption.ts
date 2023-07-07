import { ActionDataType, IActionTemplateParam } from "../../types";
import { createEnvironmentVariableString, escapeStr } from "../../utils/stringUtils";

/** Generates Csharp code for action SelectOption */
export default (params: IActionTemplateParam) => {
  const { pageName, elementName } = params;

  const data =
    params.data.dataType === ActionDataType.LiteralValue
      ? `"${escapeStr(String(params.data.rawData))}"`
      : createEnvironmentVariableString(String(params.data.rawData));

  return `await defs.${pageName}.${elementName}().selectOption(${data});`;
};
