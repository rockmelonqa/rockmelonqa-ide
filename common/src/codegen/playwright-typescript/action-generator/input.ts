import { ActionDataType, IActionTemplateParam } from "../../types";
import { createEnvironmentVariableString, escapeStr, getParameters } from "../../utils/stringUtils";

/** Generates Typescript code for action Input */
export default (params: IActionTemplateParam) => {
  const { pageName, elementName } = params;

  const data =
    params.data.dataType === ActionDataType.LiteralValue
      ? `"${escapeStr(String(params.data.rawData))}"`
      : createEnvironmentVariableString(String(params.data.rawData));

  return `await this.defs.${pageName}.${elementName}().fill(${data});`;
};
