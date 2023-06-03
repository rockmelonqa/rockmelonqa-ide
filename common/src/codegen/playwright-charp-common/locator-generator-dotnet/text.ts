import { ILocatorTemplateParam } from "../../types";
import { escapeStr } from "../../utils/stringUtils";

/** Genrates Csharp code of Locator Text */
export default (params: ILocatorTemplateParam) => {
  return params.hasParams
    ? `this._page.GetByText(string.Format(\"${escapeStr(params.locatorStr)}\", parameters))`
    : `this._page.GetByText(\"${escapeStr(params.locatorStr)}\")`;
};
