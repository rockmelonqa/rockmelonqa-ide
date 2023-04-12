import { IActionTemplateParam } from "../../types";
import { escapeStr, getParameters } from "../../utils/stringUtils";

export default (params: IActionTemplateParam) => {
  const { pageName, elementName, parameters, data } = params;
  return data
    ? `await defs.${pageName}.${elementName}(${getParameters(parameters)}).toBeHidden("${escapeStr(data)}");`
    : `await defs.${pageName}.${elementName}(${getParameters(parameters)}).toBeHidden();`;
};
