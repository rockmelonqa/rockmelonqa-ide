import { ILocatorTemplateParam } from "../../types";
import { escapeStr } from "../../utils/stringUtils";

export default (params: ILocatorTemplateParam) => {
  return params.hasParams
    ? `this._page.Locator(string.Format(\"${escapeStr(params.locatorStr)}\", parameters))`
    : `this._page.Locator(\"${escapeStr(params.locatorStr)}\")`;
};
