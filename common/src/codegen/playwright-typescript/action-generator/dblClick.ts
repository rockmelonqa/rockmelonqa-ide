import { IActionTemplateParam } from "../../types";

/** Generates ts code for action DblClick */
export default (params: IActionTemplateParam) => {
  return `await defs.${params.pageName}.${params.elementName}().dblclick();`;
};
