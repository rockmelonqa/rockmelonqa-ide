import { IActionTemplateParam } from "../../types";
import { getParameters } from "../../utils/stringUtils";

/** Generates Typescript code for action Input */
export default (params: IActionTemplateParam) => {
  const { pageName, elementName, parameters, data } = params;
  return `await this.defs.${pageName}.${elementName}(${getParameters(parameters)}).fill(${data.rawData});`;
};
