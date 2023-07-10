import { ILocatorTemplateParam } from "../../types";
import { escapeStr } from "../../utils/stringUtils";

export default (params: ILocatorTemplateParam) => {
  const { locatorStr, hasParams } = params;
  return hasParams
    ? `this.page.getByText(\"${escapeStr(locatorStr)}\".format(...parameters}))`
    : `this.page.getByText(\"${escapeStr(locatorStr)}\")`;
};
