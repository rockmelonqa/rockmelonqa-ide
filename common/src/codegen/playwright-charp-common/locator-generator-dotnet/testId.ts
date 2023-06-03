import { ILocatorTemplateParam } from "../../types";
import { escapeStr } from "../../utils/stringUtils";

/** Genrates Csharp code of Locator TestId */
export default (params: ILocatorTemplateParam) => {
  return params.hasParams
    ? `this._page.GetByTestId(string.Format("${escapeStr(params.locatorStr)}", parameters))`
    : `this._page.GetByTestId("${escapeStr(params.locatorStr)}")`;
};
