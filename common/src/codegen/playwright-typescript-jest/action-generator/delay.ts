import { IActionTemplateParam } from "../../types";

export default (params: IActionTemplateParam) => {
  return `await new Promise(rs => setTimeout(rs, ${params.data}));`;
};
