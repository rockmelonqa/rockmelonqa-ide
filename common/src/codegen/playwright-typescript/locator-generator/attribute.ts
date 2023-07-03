import { ILocatorTemplateParam } from "../../types";
import { escapeStr } from "../../utils/stringUtils";

export default (params: ILocatorTemplateParam) => {
  const { locatorStr, hasParams } = params;
  const [attr, value] = locatorStr.split("=");
  return hasParams
    ? `this.page.locator(\"${escapeStr(locatorStr)}\".format(...parameters}))`
    : `this.page.locator(\"${escapeStr(locatorStr)}\")`;
};
