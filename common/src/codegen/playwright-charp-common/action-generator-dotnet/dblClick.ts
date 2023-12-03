import { IActionTemplateParam } from "../../types";
import { getParameters } from "../../utils/stringUtils";

/** Generates Csharp code for action Dbl Click */
export default (params: IActionTemplateParam) => {
  return `await this.defs.${params.pageName}.${params.elementName}(${getParameters(
    params.parameters
  )}).DblClickAsync();`;
};
