import { IActionTemplateParam } from "../../types";
import { escapeStr } from "../stringUtils";

export default (params: IActionTemplateParam) => {
  return `await Expect(Page).ToHaveTitleAsync(new System.Text.RegularExpressions.Regex("${escapeStr(params.data)}"));`;
};
