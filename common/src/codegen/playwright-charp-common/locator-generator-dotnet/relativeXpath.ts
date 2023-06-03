import { ILocatorTemplateParam } from "../../types";
import { escapeStr, upperCaseFirstChar } from "../../utils/stringUtils";

/** Genrates Csharp code of Locator Relative by XPath */
export default (params: ILocatorTemplateParam) => {
  let [referenceLocator, referencePath] = params.locatorStr.split(":");
  return `this.${upperCaseFirstChar(referenceLocator)}().Locator(\"xpath=${escapeStr(referencePath)}\")`;
};
