import { IActionTemplateParam } from "../../types";

/** Generates Typescript code for action Click on "Popup" link */
export default (params: IActionTemplateParam) => {
  const { pageName, elementName } = params;

  return `
await this.pageTest.clickOpenPopup(async () => await this.defs.${pageName}.${elementName}().click());
    `.trim();
};
