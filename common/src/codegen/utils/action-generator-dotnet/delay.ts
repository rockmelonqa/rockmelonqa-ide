import { IActionTemplateParam } from "../../types";

export default (params: IActionTemplateParam) => {
  return `await Task.Delay(${params.data});`;
};
