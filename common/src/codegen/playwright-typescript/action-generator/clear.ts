import { IActionTemplateParam } from "../../types";
import { getParameters } from "../../utils/stringUtils";

/** Generates Typescript code for action Clear */
export default (params: IActionTemplateParam) => {
  return `await this.defs.${params.pageName}.${params.elementName}().fill("");`;
};
