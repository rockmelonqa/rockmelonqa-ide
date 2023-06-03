import { ILocatorTemplateParam } from "../../types";
import { escapeStr } from "../../utils/stringUtils";

/** Genrates Csharp code of Locator Name (by `name` attribute) */
export default (params: ILocatorTemplateParam) => {
  return params.hasParams
    ? `this._page.Locator(string.Format(\"[name=${escapeStr(params.locatorStr)}]\", parameters))`
    : `this._page.Locator(\"[name=${escapeStr(params.locatorStr)}]\")`;
};
