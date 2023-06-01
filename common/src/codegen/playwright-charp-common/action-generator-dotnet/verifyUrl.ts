import { IActionTemplateParam } from "../../types";
import { escapeStr } from "../../utils/stringUtils";

/** Generates Csharp code for action Verify Url */
export default (params: IActionTemplateParam) => {
  return `await Expect(defs.Page).ToHaveURLAsync("${escapeStr(params.data)}");`;
};
