import { IActionTemplateParam } from "../../types";
import { escapeStr, getParameters } from "../../utils/stringUtils";

export default (params: IActionTemplateParam) => {
  return `await Expect(defs.Page).ToHaveURLAsync(${params.data});`;
};
