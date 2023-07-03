import { ILocatorTemplateParam } from "../../types";
import { escapeStr } from "../../utils/stringUtils";

export default (params: ILocatorTemplateParam) => {
  const { locatorStr, hasParams } = params;
  return hasParams
    ? `this.page.frameLocator(\"${escapeStr(locatorStr)}\".format(...parameters}))`
    : `this.page.frameLocator(\"${escapeStr(locatorStr)}\")`;
};
