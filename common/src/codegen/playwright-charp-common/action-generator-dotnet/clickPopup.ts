import { IActionTemplateParam } from "../../types";

/** Generates Csharp code for action Click on "Popup" link */
export default (params: IActionTemplateParam) => {
  const { pageName, elementName } = params;
  return `
defs = new PageDefinitions(await this.Page.RunAndWaitForPopupAsync(async () => await defs.${pageName}.${elementName}().ClickAsync()));
await defs.Page.WaitForLoadStateAsync();
    `.trim();
};
