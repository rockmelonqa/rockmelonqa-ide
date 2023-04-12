import { ILocatorTemplateParam } from "../../types";
import { escapeStr } from "../../utils/stringUtils";

export default (params: ILocatorTemplateParam) => {
  return params.hasParams
    ? `this._page.Locator(string.Format(\"xpath=\\*[@data-testid='${escapeStr(params.locatorStr)}']\", parameters))`
    : `this._page.Locator(\"xpath=\\*[@data-testid='${escapeStr(params.locatorStr)}']\")`;
};
