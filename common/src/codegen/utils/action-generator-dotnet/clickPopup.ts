import { EOL } from "os";
import { IActionTemplateParam } from "../../types";
import { getParameters } from "../../utils/stringUtils";

export default (params: IActionTemplateParam) => {
  const { pageName, elementName } = params;
  return `
defs = new PageDefinitions(
        await this.Page.RunAndWaitForPopupAsync(async () =>
        {
            await defs.${pageName}.${elementName}().ClickAsync();
        }));

        await defs.Page.WaitForLoadStateAsync();
    `.trim();
};
