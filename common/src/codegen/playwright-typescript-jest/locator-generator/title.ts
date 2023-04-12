import { ILocatorTemplateParam } from "../../types";
import { escapeStr } from "../../utils/stringUtils";

export default (params: ILocatorTemplateParam) => {
  const { locatorStr, hasParams } = params;
  return hasParams
    ? `this._page.getByTitle(\"${escapeStr(locatorStr)}\".format(...parameters}))`
    : `this._page.getByTitle(\"${escapeStr(locatorStr)}\")`;
};
