import { ILocatorTemplateParam } from "../../types";
import { escapeStr } from "../../utils/stringUtils";

export default (params: ILocatorTemplateParam) => {
  return params.hasParams
    ? `this._page.FrameLocator(string.Format("[name=\\"${escapeStr(params.locatorStr)}\\"]", parameters))`
    : `this._page.FrameLocator("[name=\\"${escapeStr(params.locatorStr)}\\"]")`;
};
