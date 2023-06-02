import { IActionTemplateParam } from "../../types";
import { escapeStr } from "../../utils/stringUtils";

/** Generates Csharp code for action Verify HasTitle */
export default (params: IActionTemplateParam) => {
  return `await Expect(defs.Page).ToHaveTitleAsync("${escapeStr(params.data)}");`;
};
