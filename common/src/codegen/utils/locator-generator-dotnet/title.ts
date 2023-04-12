import { ILocatorTemplateParam } from "../../types";
import { escapeStr } from "../../utils/stringUtils";

export default (params: ILocatorTemplateParam) => {
  return params.hasParams
    ? `this._page.GetByTitle(string.Format(\"${escapeStr(params.locatorStr)}\", parameters))`
    : `this._page.GetByTitle(\"${escapeStr(params.locatorStr)}\")`;
};
