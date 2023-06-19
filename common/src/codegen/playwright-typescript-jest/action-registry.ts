import { ActionType } from "../../file-defs";
import { IActionTemplateParam } from "../types";

export const actionRegisty = new Map<ActionType, (params: IActionTemplateParam) => string>();
