import { IActionTemplateParam } from "../../types";
import { escapeStr } from "../../utils/stringUtils";

/** Generates Csharp code for action GotoUrl */
export default (params: IActionTemplateParam) => {
  return `await Page.GotoAsync("${escapeStr(params.data)}");`;
};
