import { IActionTemplateParam } from "../../types";
import { getParameters } from "../../utils/stringUtils";

export default (params: IActionTemplateParam) => {
  return params.data;
};