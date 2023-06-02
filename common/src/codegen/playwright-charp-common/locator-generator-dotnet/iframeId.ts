import { ILocatorTemplateParam } from "../../types";
import { escapeStr } from "../../utils/stringUtils";

/** Genrates Csharp code of Locator IFrame by Id */
export default (params: ILocatorTemplateParam) => {
  return params.hasParams
    ? `this._page.FrameLocator(string.Format("[id=\\"${escapeStr(params.locatorStr)}\\"]", parameters))`
    : `this._page.FrameLocator("[id=\\"${escapeStr(params.locatorStr)}\\"]")`;
};
