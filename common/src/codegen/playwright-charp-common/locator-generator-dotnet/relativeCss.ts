import { ILocatorTemplateParam } from "../../types";
import { upperCaseFirstChar } from "../../utils/stringUtils";

/** Genrates Csharp code of Locator Relative by Css.; */
export default (params: ILocatorTemplateParam) => {
  let [referenceLocator, referencePath] = params.locatorStr.split(":");
  return `this.${upperCaseFirstChar(referenceLocator)}().Locator(\"${referencePath}\")`;
};
