import { ILocatorTemplateParam } from "../../types";

/** Genrates Locator with raw Csharp code */
export default (params: ILocatorTemplateParam) => {
  return params.locatorStr;
};
