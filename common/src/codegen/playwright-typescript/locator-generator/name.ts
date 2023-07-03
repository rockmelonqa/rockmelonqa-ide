import { ILocatorTemplateParam } from "../../types";
import { escapeStr } from "../../utils/stringUtils";

export default (params: ILocatorTemplateParam) => {
  const { locatorStr } = params;
  return `this.page.locator("[name=${escapeStr(locatorStr)}]")`;
};
