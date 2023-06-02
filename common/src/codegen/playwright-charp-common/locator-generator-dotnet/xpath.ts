import { ILocatorTemplateParam } from "../../types";
import { escapeStr } from "../../utils/stringUtils";

/** Genrates Csharp code of Locator XPath */
export default (params: ILocatorTemplateParam) => {
  return params.hasParams
    ? `this._page.Locator(string.Format(\"xpath=${escapeStr(params.locatorStr)}\", parameters))`
    : `this._page.Locator(\"xpath=${escapeStr(params.locatorStr)}\")`;
};
