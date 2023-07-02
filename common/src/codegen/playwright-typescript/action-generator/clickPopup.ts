import { IActionTemplateParam } from "../../types";

/** Generates Csharp code for action Click on "Popup" link */
export default (params: IActionTemplateParam) => {
  const { pageName, elementName } = params;

  return `    var popupPromise = defs.page.waitForEvent("popup");
    await defs.${pageName}.${elementName}().click();
    var popup = await popupPromise;
    await popup.waitForLoadState();
    defs = new PageDefinitions(popup);
    `.trim();
};
