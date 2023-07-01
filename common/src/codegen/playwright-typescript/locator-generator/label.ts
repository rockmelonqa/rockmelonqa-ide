import { ILocatorTemplateParam } from "../../types";
import { escapeStr } from "../../utils/stringUtils";

export default (params: ILocatorTemplateParam) => {
  const { locatorStr, hasParams } = params;
  return params.hasParams
    ? `this._page.getByLabel(\"${escapeStr(locatorStr)}\".format(...parameters}))`
    : `this._page.getByLabel(\"${escapeStr(locatorStr)}\")`;
};
