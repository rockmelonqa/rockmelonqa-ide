import { IActionTemplateParam } from "../../types";
import { getParameters } from "../../utils/stringUtils";

export default (params: IActionTemplateParam) => {
  return `await defs.${params.pageName}.${params.elementName}(${getParameters(params.parameters)}).ClickAsync();`;
};
