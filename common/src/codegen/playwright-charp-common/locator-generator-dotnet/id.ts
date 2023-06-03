import { ILocatorTemplateParam } from "../../types";
import { escapeStr } from "../../utils/stringUtils";

/** Genrates Csharp code of Locator Id */
export default (params: ILocatorTemplateParam) => {
  return params.hasParams
    ? `this._page.Locator(string.Format(\"id=${escapeStr(params.locatorStr)}\", parameters))`
    : `this._page.Locator(\"id=${escapeStr(params.locatorStr)}\")`;
};
