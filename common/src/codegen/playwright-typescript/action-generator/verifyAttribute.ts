import { StandardOutputFile } from "../../../file-defs";
import { ActionDataType, IActionTemplateParam } from "../../types";
import { createEnvironmentVariableString, escapeStr, getParameters } from "../../utils/stringUtils";

const getValuesFromDataString = (dataString: string) => {
  let temp = dataString.split("=");
  let attributeName = temp[0];
  let attributeValue = temp.length === 2 ? temp[1] : "";
  return [attributeName, attributeValue];
};

/** Generates Csharp code for action Verify Attribute */
export default (params: IActionTemplateParam) => {
  const { pageName, elementName, parameters } = params;

  if (params.data.dataType === ActionDataType.LiteralValue) {
    const [attributeName, attributeValue] = getValuesFromDataString(params.data.rawData);
    return `await expect(defs.${pageName}.${elementName}()).toHaveAttribute(\"${escapeStr(
      attributeName
    )}\", \"${attributeValue}\");`;
  }

  const data = `${StandardOutputFile.EnvironmentSettings}.${params.data.rawData}.split("=")[0] ?? "", ${StandardOutputFile.EnvironmentSettings}.${params.data.rawData}.split("=")[1] ?? ""`;

  return `await expect(defs.${pageName}.${elementName}()).toHaveAttribute(${data});`;
};
