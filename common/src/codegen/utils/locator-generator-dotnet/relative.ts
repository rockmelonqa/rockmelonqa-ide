import { ILocatorTemplateParam } from "../../types";
import { upperCaseFirstChar } from "../../utils/stringUtils";

export default (params: ILocatorTemplateParam) => {
  let [referenceLocator, referencePath] = params.locatorStr.split(":");
  return `this.${upperCaseFirstChar(referenceLocator)}().Locator(\"${referencePath}\")`;
};
