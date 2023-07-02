import { IActionTemplateParam } from "../../types";
import { getParameters } from "../../utils/stringUtils";

/** Generates Csharp code for action Click */
export default (params: IActionTemplateParam) => {
  return `await defs.${params.pageName}.${params.elementName}().click();`;
};
