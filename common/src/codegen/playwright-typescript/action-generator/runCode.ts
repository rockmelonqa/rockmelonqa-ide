import { IActionTemplateParam } from "../../types";

/** Generates Typescript code for action RunCode */
export default (params: IActionTemplateParam) => {
  return params.data.rawData;
};
