import { ILocatorTemplateParam } from "../../types";
import { escapeStr } from "../../utils/stringUtils";

/** Genrates Csharp code of Locator Placeholder */
export default (params: ILocatorTemplateParam) => {
  return params.hasParams
    ? `this._page.GetByPlaceholder(string.Format(\"${escapeStr(params.locatorStr)}\", parameters))`
    : `this._page.GetByPlaceholder(\"${escapeStr(params.locatorStr)}\")`;
};
