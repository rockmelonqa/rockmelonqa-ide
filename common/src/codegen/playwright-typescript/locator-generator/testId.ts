import { ILocatorTemplateParam } from "../../types";
import { escapeStr } from "../../utils/stringUtils";

export default (params: ILocatorTemplateParam) => {
  const { locatorStr, hasParams } = params;
  return hasParams
    ? `this.page.getByTestId("${escapeStr(locatorStr)}".format(...parameters}))`
    : `this.page.getByTestId("${escapeStr(locatorStr)}")`;
};
