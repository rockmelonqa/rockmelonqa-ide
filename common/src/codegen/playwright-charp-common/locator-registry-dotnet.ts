import { LocatorType } from "../../file-defs";
import { ILocatorTemplateParam } from "../types";

import attribute from "./locator-generator-dotnet/attribute";
import code from "./locator-generator-dotnet/code";
import css from "./locator-generator-dotnet/css";
import id from "./locator-generator-dotnet/id";
import iFrame from "./locator-generator-dotnet/iframe";
import iFrameId from "./locator-generator-dotnet/iframeId";
import iFrameName from "./locator-generator-dotnet/iframeName";
import label from "./locator-generator-dotnet/label";
import name from "./locator-generator-dotnet/name";
import placeholder from "./locator-generator-dotnet/placeholder";
import relativeCss from "./locator-generator-dotnet/relativeCss";
import relativeXpath from "./locator-generator-dotnet/relativeXpath";
import testId from "./locator-generator-dotnet/testId";
import text from "./locator-generator-dotnet/text";
import title from "./locator-generator-dotnet/title";
import xpath from "./locator-generator-dotnet/xpath";

export const locatorRegistyDotnet = new Map<LocatorType, (params: ILocatorTemplateParam) => string>();

locatorRegistyDotnet
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
  .set(LocatorType.RelativeCss, relativeCss)
  .set(LocatorType.RelativeXpath, relativeXpath)
  .set(LocatorType.TestId, testId)
  .set(LocatorType.Text, text)
  .set(LocatorType.Title, title)
  .set(LocatorType.Xpath, xpath);
