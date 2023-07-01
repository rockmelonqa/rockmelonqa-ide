import { stringResKeys } from "$lib/context/StringResKeys";
import type { IUiContext } from "$lib/context/UiContext";
import type { IDropdownOption } from "$lib/controls/DropdownField";
import { ActionType, AutomationFramework, Indent, Language, LocatorType, TestFramework } from "rockmelonqa.common";
import type { IEnvironmentFileInfo } from "rockmelonqa.common/codegen/types";
import { Browser } from "rockmelonqa.common/file-defs/rmProjFile";

const toLowerFirstChar = (str: string): string => {
    return `${str.charAt(0).toLowerCase()}${str.slice(1)}`;
};
const toUpperFirstChar = (str: string): string => {
    return `${str.charAt(0).toUpperCase()}${str.slice(1)}`;
};

export const automationFrameworkOptions: IDropdownOption[] = [
    { key: AutomationFramework.Playwright, text: AutomationFramework.Playwright.toString() },
    //{ key: AutomationFramework.Selenium, text: AutomationFramework.Selenium.toString() },
];

export const lanugageOptions: IDropdownOption[] = [
    { key: Language.CSharp, text: Language.CSharp.toString() },
    //{ key: Language.Java, text: Language.Java.toString() },
    { key: Language.Typescript, text: Language.Typescript.toString() },
];

export const testFrameworkOptions: IDropdownOption[] = [
    // { key: TestFramework.JUnit, text: TestFramework.JUnit.toString() },
    { key: TestFramework.MSTest, text: TestFramework.MSTest.toString() },
    { key: TestFramework.NUnit, text: TestFramework.NUnit.toString() },
    { key: TestFramework.xUnit, text: TestFramework.xUnit.toString() },
];

export const indentOptions: IDropdownOption[] = [
    { key: Indent.Spaces, text: Indent.Spaces.toString() },
    { key: Indent.Tabs, text: Indent.Tabs.toString() },
];

export const browserOptions: IDropdownOption[] = [
    { key: Browser.Chromium, text: toUpperFirstChar(Browser.Chromium.toString()) },
    { key: Browser.Firefox, text: toUpperFirstChar(Browser.Firefox.toString()) },
    { key: Browser.Webkit, text: toUpperFirstChar(Browser.Webkit.toString()) },
];

export const getLocatorTypeDropDownOptions = (uiContext: IUiContext): IDropdownOption[] => {
    return Object.keys(LocatorType).map((key) => ({
        key: key,
        text: uiContext.str(`locatorType.${toLowerFirstChar(key)}`),
    }));
};

export const getActionTypeDropDownOptions = (uiContext: IUiContext): IDropdownOption[] => {
    return Object.keys(ActionType).map((key) => ({
        key: key,
        text: uiContext.str(`actionType.${toLowerFirstChar(key)}`),
    }));
};

export const getBrowserDropDownOptions = (uiContext: IUiContext): IDropdownOption[] => {
    return [{ key: "", text: uiContext.str(stringResKeys.runTestDialog.headless) }, ...browserOptions];
};

export const getEnvironmentFileDropDownOptions = (
    uiContext: IUiContext,
    environments: IEnvironmentFileInfo[]
): IDropdownOption[] => {
    return environments.map((e) => ({ key: e.outputFileRelPath, text: e.inputFileName }));
};
