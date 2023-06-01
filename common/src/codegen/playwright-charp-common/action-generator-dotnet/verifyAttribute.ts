import { IActionTemplateParam } from "../../types";
import { escapeStr, getParameters } from "../../utils/stringUtils";

/** Generates Csharp code for action Verify Attribute */
export default (params: IActionTemplateParam) => {
  const { pageName, elementName, parameters, data } = params;
  let temp = data.split("=");
  let attributeName = temp[0];
  let attributeValue = temp.length === 2 ? temp[1] : "";
  return `await Expect(defs.${pageName}.${elementName}(${getParameters(parameters)})).ToHaveAttributeAsync(\"${escapeStr(
    attributeName
  )}\", \"${attributeValue}\");`;
};
