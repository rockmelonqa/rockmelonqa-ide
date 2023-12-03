import { EOL } from "os";
import { IActionTemplateParam } from "../../types";

/** Generates Typescript code for action Add Comment */
export default (params: IActionTemplateParam) => {
  return `${EOL}// ${params.data.rawData}`;
};
