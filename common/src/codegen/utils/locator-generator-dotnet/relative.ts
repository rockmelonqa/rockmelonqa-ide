import { ILocatorTemplateParam } from "../../types";
import { escapeStr } from "../../utils/stringUtils";

export default (params: ILocatorTemplateParam) => {
  let [referenceLocator, referencePath] = params.locatorStr.split(":");
  return `this.${referenceLocator}().Locator(\"${referencePath}\")`;
};
