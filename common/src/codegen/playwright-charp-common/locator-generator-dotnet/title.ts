import { ILocatorTemplateParam } from "../../types";
import { escapeStr } from "../../utils/stringUtils";

/** Genrates Csharp code of Locator Title */
export default (params: ILocatorTemplateParam) => {
  return params.hasParams
    ? `this.Page.GetByTitle(string.Format(\"${escapeStr(params.locatorStr)}\", parameters))`
    : `this.Page.GetByTitle(\"${escapeStr(params.locatorStr)}\")`;
};
