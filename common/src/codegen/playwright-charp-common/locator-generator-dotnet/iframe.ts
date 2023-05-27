import { ILocatorTemplateParam } from "../../types";
import { escapeStr } from "../../utils/stringUtils";

export default (params: ILocatorTemplateParam) => {
  return params.hasParams
    ? `this._page.FrameLocator(string.Format(\"${escapeStr(params.locatorStr)}\", parameters))`
    : `this._page.FrameLocator(\"${escapeStr(params.locatorStr)}\")`;
};
