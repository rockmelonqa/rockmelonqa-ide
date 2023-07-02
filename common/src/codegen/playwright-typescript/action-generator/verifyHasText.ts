import { ActionDataType, IActionTemplateParam } from "../../types";
import { createEenvironmentVariableString, escapeStr, getParameters } from "../../utils/stringUtils";

/** Generates Csharp code for action VerifyHasText */
export default (params: IActionTemplateParam) => {
  const { pageName, elementName, parameters } = params;

  const data =
    params.data.dataType === ActionDataType.LiteralValue
      ? `"${escapeStr(String(params.data.rawData))}"`
      : createEenvironmentVariableString(String(params.data.rawData));

  return `await expect(defs.${pageName}.${elementName}(${getParameters(parameters)})).toHaveText(${data});`;
};
