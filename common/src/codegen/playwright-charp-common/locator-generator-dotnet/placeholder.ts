import { ILocatorTemplateParam } from "../../types";
import { escapeStr } from "../../utils/stringUtils";

/** Genrates Csharp code of Locator Placeholder */
export default (params: ILocatorTemplateParam) => {
  return params.hasParams
    ? `this.Page.GetByPlaceholder(string.Format(\"${escapeStr(params.locatorStr)}\", parameters))`
    : `this.Page.GetByPlaceholder(\"${escapeStr(params.locatorStr)}\")`;
};
