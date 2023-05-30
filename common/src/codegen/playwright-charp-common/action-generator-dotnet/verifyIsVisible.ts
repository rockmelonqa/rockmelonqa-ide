import { IActionTemplateParam } from "../../types";
import { escapeStr, getParameters } from "../../utils/stringUtils";

export default (params: IActionTemplateParam) => {
  const { pageName, elementName, parameters, data } = params;
  return data
    ? `await Expect(defs.${pageName}.${elementName}(${getParameters(parameters)})).ToBeVisibleAsync("${escapeStr(data)}");`
    : `await Expect(defs.${pageName}.${elementName}(${getParameters(parameters)})).ToBeVisibleAsync();`;
};
