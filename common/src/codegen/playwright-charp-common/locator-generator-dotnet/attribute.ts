import { ILocatorTemplateParam } from "../../types";
import { escapeStr } from "../../utils/stringUtils";

/** Genrates Csharp code of Locator Attribute */
export default (params: ILocatorTemplateParam) => {
  const [attr = "", value = ""] = params.locatorStr.split("=");
  return `this._page.Locator("//*[@${escapeStr(attr)} = '${escapeStr(value)}']")`;
};
