import { IActionTemplateParam } from "../../types";
import { getParameters } from "../../utils/stringUtils";

export default (params: IActionTemplateParam) => {
  const { pageName, elementName, parameters, data } = params;
  return `await defs.${pageName}.${elementName}(${getParameters(parameters)}).FillAsync("${data}");`;
};
