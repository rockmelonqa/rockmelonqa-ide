import { LocatorType } from "../../file-defs";
import { ILocatorTemplateParam } from "../types";

import attribute from "./locator-generator/attribute";
import code from "./locator-generator/code";
import css from "./locator-generator/css";
import iFrame from "./locator-generator/iframe";
import iFrameId from "./locator-generator/iframeId";
import iFrameName from "./locator-generator/iframeName";
import id from "./locator-generator/id";
import label from "./locator-generator/label";
import name from "./locator-generator/name";
import placeholder from "./locator-generator/placeholder";
import relative from "./locator-generator/relative";
import testId from "./locator-generator/testId";
import text from "./locator-generator/text";
import title from "./locator-generator/title";
import xpath from "./locator-generator/xpath";

export const locatorRegisty = new Map<LocatorType, (params: ILocatorTemplateParam) => string>();

locatorRegisty
  .set(LocatorType.Attribute, attribute)
  .set(LocatorType.Code, code)
  .set(LocatorType.Css, css)
  .set(LocatorType.IFrame, iFrame)
  .set(LocatorType.IFrameId, iFrameId)
  .set(LocatorType.IFrameName, iFrameName)
  .set(LocatorType.Id, id)
  .set(LocatorType.Label, label)
  .set(LocatorType.Name, name)
  .set(LocatorType.Placeholder, placeholder)
  .set(LocatorType.Relative, relative)
  .set(LocatorType.TestId, testId)
  .set(LocatorType.Text, text)
  .set(LocatorType.Title, title)
  .set(LocatorType.Xpath, xpath);
