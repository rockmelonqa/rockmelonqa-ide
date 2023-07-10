import { ILocatorTemplateParam } from "../../types";
import { escapeStr } from "../../utils/stringUtils";

export default (params: ILocatorTemplateParam) => {
  return `this.page.${params.locatorStr}"`;
};
