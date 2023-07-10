import { IActionTemplateParam } from "../../types";
import { getParameters } from "../../utils/stringUtils";

/** Generates Csharp code for action Verify IsReadOnly */
export default (params: IActionTemplateParam) => {
  const { pageName, elementName, parameters } = params;
  return `await expect(defs.${pageName}.${elementName}(${getParameters(
    parameters
  )})).toBeEditable({ editable: false });`;
};
