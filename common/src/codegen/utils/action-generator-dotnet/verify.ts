import { IActionTemplateParam } from "../../types";
import { escapeStr, getParameters } from "../../utils/stringUtils";

export default (params: IActionTemplateParam) => {
  const { pageName, elementName, parameters, data } = params;
  return `await this.VerifyAsync(defs.${pageName}.${elementName}(${getParameters(parameters)}), \"${escapeStr(data)}\");`;
};
