import { ILocatorTemplateParam } from "../../types";
import { escapeStr } from "../../utils/stringUtils";

/** Genrates Csharp code of Locator Name (by `name` attribute) */
export default (params: ILocatorTemplateParam) => {
  return params.hasParams
    ? `this.Page.Locator(string.Format(\"[name=${escapeStr(params.locatorStr)}]\", parameters))`
    : `this.Page.Locator(\"[name=${escapeStr(params.locatorStr)}]\")`;
};
