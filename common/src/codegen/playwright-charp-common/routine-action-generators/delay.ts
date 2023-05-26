import { IActionTemplateParam } from "../../types";

export default (params: IActionTemplateParam) => {
  return `await Task.Delay(Int32.Parse(${params.data}));`;
};
