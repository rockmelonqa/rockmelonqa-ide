import { IActionTemplateParam } from "../../types";
import { escapeStr, getParameters } from "../../utils/stringUtils";

export default (params: IActionTemplateParam) => {
  const { pageName, elementName, parameters, data } = params;
  return parameters.length
    ? `await expect(defs.${pageName}.${elementName}([${getParameters(parameters)}])).verify("${escapeStr(data)}");`
    : `await expect(defs.${pageName}.${elementName}()).verify("${escapeStr(data)}");`;
};
