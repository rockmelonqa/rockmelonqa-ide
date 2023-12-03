import { IActionTemplateParam } from "../../types";

/** Generates Typescript code for action Click */
export default (params: IActionTemplateParam) => {
  return `await this.defs.${params.pageName}.${params.elementName}().click();`;
};
