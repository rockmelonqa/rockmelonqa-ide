import { IActionTemplateParam } from "../../types";

/** Generates Csharp code for action RunCode */
export default (params: IActionTemplateParam) => {
  return params.data;
};
