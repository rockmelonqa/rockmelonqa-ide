import { IActionTemplateParam } from "../../types";

/** Generates Csharp code for action Click on "Popup" link */
export default (params: IActionTemplateParam) => {
  const { pageName, elementName } = params;
  return `
await this.ClickOpenPopupAsync(async () => await defs.${pageName}.${elementName}().ClickAsync());
    `.trim();
};
