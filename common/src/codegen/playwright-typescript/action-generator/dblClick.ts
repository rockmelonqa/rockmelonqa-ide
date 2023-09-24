import { IActionTemplateParam } from "../../types";

/** Generates Typescript code for action DblClick */
export default (params: IActionTemplateParam) => {
  return `await this.defs.${params.pageName}.${params.elementName}().dblclick();`;
};
