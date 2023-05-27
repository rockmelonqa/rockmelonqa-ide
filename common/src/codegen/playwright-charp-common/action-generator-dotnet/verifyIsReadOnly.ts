import { IActionTemplateParam } from "../../types";
import { getParameters } from "../../utils/stringUtils";

export default (params: IActionTemplateParam) => {
  const { pageName, elementName, parameters } = params;
  return `await Expect(defs.${pageName}.${elementName}(${getParameters(
    parameters
  )})).ToBeEditableAsync(new LocatorAssertionsToBeEditableOptions { Editable = false });`;
};
