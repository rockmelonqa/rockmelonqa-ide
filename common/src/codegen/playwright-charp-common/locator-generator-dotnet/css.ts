import { ILocatorTemplateParam } from "../../types";
import { escapeStr } from "../../utils/stringUtils";

/** Genrates Csharp code of Locator CSS */
export default (params: ILocatorTemplateParam) => {
  return params.hasParams
    ? `this.Page.Locator(string.Format(\"${escapeStr(params.locatorStr)}\", parameters))`
    : `this.Page.Locator(\"${escapeStr(params.locatorStr)}\")`;
};
