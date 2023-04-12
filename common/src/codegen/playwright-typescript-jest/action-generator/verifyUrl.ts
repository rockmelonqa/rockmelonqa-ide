import { IActionTemplateParam } from "../../types";
import { escapeStr, getParameters } from "../../utils/stringUtils";

export default (params: IActionTemplateParam) => {
  return `await expect(defs.Page).toHaveURL("${escapeStr(params.data)}");`;
};
