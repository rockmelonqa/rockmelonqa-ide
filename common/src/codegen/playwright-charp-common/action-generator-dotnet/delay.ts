import { IActionTemplateParam } from "../../types";

/** Generates Csharp code for action Delay */
export default (params: IActionTemplateParam) => {
  const milliseconds = parseInt(params.data) || 0;
  return `await Task.Delay(${milliseconds});`;
};
