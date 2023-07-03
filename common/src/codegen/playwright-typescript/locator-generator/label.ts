import { ILocatorTemplateParam } from "../../types";
import { escapeStr } from "../../utils/stringUtils";

export default (params: ILocatorTemplateParam) => {
  const { locatorStr, hasParams } = params;
  return params.hasParams
    ? `this.page.getByLabel(\"${escapeStr(locatorStr)}\".format(...parameters}))`
    : `this.page.getByLabel(\"${escapeStr(locatorStr)}\")`;
};
