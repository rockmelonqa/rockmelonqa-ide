import { IActionTemplateParam } from "../../types";

export default (params: IActionTemplateParam) => {
  return `await Expect(Page).ToHaveTitleAsync(new System.Text.RegularExpressions.Regex(${params.data}));`;
};
