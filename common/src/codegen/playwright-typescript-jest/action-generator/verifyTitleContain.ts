import { IActionTemplateParam } from "../../types";
import { escapeStr } from "../../utils/stringUtils";

export default (params: IActionTemplateParam) => {
  return `expect(await page.title()).toContain("${escapeStr(params.data)}");`;
};
