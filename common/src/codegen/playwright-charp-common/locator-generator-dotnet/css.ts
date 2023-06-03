import { ILocatorTemplateParam } from "../../types";
import { escapeStr } from "../../utils/stringUtils";

/** Genrates Csharp code of Locator CSS */
export default (params: ILocatorTemplateParam) => {
  return params.hasParams
    ? `this._page.Locator(string.Format(\"${escapeStr(params.locatorStr)}\", parameters))`
    : `this._page.Locator(\"${escapeStr(params.locatorStr)}\")`;
};
