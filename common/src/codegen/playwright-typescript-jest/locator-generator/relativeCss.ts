import { ILocatorTemplateParam } from "../../types";
import { escapeStr } from "../../utils/stringUtils";

export default (params: ILocatorTemplateParam) => {
  const { locatorStr, hasParams } = params;
  let [referenceLocator, referencePath] = locatorStr.split(":");
  return hasParams
    ? `this.${referenceLocator}(parameters).locator(\"${referencePath}\")`
    : `this.${referenceLocator}().locator(\"${referencePath}\")`;
};
