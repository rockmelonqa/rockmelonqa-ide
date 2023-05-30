import { EOL } from "os";
import { IActionTemplateParam } from "../../types";
import { getParameters } from "../../utils/stringUtils";

export default (params: IActionTemplateParam) => {
  return `
await defs.Page.CloseAsync();
defs = new PageDefinitions(this.Page);
  `;
};
