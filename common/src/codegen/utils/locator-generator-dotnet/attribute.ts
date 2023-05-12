import { ILocatorTemplateParam } from "../../types";
import { escapeStr } from "../../utils/stringUtils";

export default (params: ILocatorTemplateParam) => {
  const [attr = "", value = ""] = params.locatorStr.split("=");
  return `this._page.Locator("//*[@${escapeStr(attr)} = '${escapeStr(value)}']")`;
};
