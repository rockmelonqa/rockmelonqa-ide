import { IActionTemplateParam } from "../../types";
import { escapeStr, getParameters } from "../../utils/stringUtils";

/** Generates Csharp code for action VerifyHasValue */
export default (params: IActionTemplateParam) => {
  const { pageName, elementName, parameters, data } = params;
  return `await Expect(defs.${pageName}.${elementName}(${getParameters(parameters)})).ToHaveValueAsync("${escapeStr(data)}");`;
};
