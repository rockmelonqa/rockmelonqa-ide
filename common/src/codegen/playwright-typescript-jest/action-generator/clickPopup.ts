import { EOL } from "os";
import { IActionTemplateParam } from "../../types";
import { getParameters } from "../../utils/stringUtils";

export default (params: IActionTemplateParam) => {
  const { pageName, elementName } = params;
  return (
    `defs = new PageDefinitions(${EOL}` +
    `    await page.runAndWaitForPopup(async () => {{${EOL}` +
    `        await defs.${pageName}.${elementName}().click();${EOL}` +
    `    }})${EOL}` +
    `);${EOL}` +
    `await defs.Page.waitForLoadState();`
  );
};
