import { ActionType, StandardFileExtension } from "rockmelonqa.common";
import type { ComponentType } from "svelte";
import PageDefinitionEditor from "./PageDefinitionEditor.svelte";
import RmProjectEditor from "./RmProjectEditor.svelte";
import TestCaseEditor from "./TestCaseEditor.svelte";
import TestRoutineEditor from "./TestRoutineEditor/TestRoutineEditor.svelte";
import TestSuiteEditor from "./TestSuiteEditor.svelte";
import TextEditor from "./TextEditor.svelte";
import TrxViewer from "./TrxViewer/TrxViewer.svelte";
import EnvEditor from "./EnvironmentEditor.svelte";
import HtmlViewer from "./HtmlViewer.svelte";
import PhotoViewer from "./PhotoViewer.svelte";

export const getEditor = (fileName: string): ComponentType | undefined => {
    const lastIndex = fileName.lastIndexOf(".");
    const ext = lastIndex < 0 ? "" : fileName.substring(lastIndex).toLowerCase();
    switch (ext) {
        case StandardFileExtension.Environment:
            return EnvEditor;
        case StandardFileExtension.Page:
            return PageDefinitionEditor;
        case StandardFileExtension.Project:
            return RmProjectEditor;
        case StandardFileExtension.TestCase:
            return TestCaseEditor;
        case StandardFileExtension.TestRoutine:
            return TestRoutineEditor;
        case StandardFileExtension.TestSuite:
            return TestSuiteEditor;
        case ".trx":
            return TrxViewer;
        case ".html":
            return HtmlViewer;
        case ".jpg":
        case ".png":
        case ".gif":
        case ".bmp":
        case ".webp":
            // Maybe more image formats
            return PhotoViewer;
        default:
            return TextEditor;
    }
};

/**
 * Build 'Title / Display Name' based on original one
 */
export const toTitle = (fileName: string): string => {
    // handle extension
    const lastIndex = fileName.lastIndexOf(".");
    const ext = lastIndex < 0 ? "" : fileName.substring(lastIndex).toLowerCase();
    switch (ext) {
        case StandardFileExtension.Environment:
            fileName = fileName.slice(0, -StandardFileExtension.Environment.length) + " Environment";
            break;
        case StandardFileExtension.Page:
            fileName = fileName.slice(0, -StandardFileExtension.Page.length) + " Page";
            break;
        case StandardFileExtension.TestCase:
            fileName = fileName.slice(0, -StandardFileExtension.TestCase.length) + " Test Case";
            break;
        case StandardFileExtension.TestRoutine:
            fileName = fileName.slice(0, -StandardFileExtension.TestRoutine.length) + " Test Routine";
            break;
        case StandardFileExtension.TestSuite:
            fileName = fileName.slice(0, -StandardFileExtension.TestSuite.length) + " Test Suite";
            break;
    }

    // insert spaces between words
    // example: 'businessInsurance' -> 'Business Insurance'
    let formatted = fileName.replace(/([a-z])([A-Z])/g, "$1 $2");

    // replace special characters with spaces
    // example: 'Business---Insruance' -> 'Business   Insurance'
    formatted = formatted.replace(/[^a-zA-Z0-9]/g, " ");

    // remove extra whitespace and capitalize words
    formatted = formatted
        .trim()
        .replace(/\s+/g, " ") // replace multiple spaces by single space
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // first character of each word should be uppercase
        .join(" ");

    return formatted;
};

export const pagelessActions = [
    ActionType.ClosePopup.toString(),
    ActionType.Delay.toString(),
    ActionType.GoToUrl.toString(),
    ActionType.RunCode.toString(),
    ActionType.RunTestRoutine.toString(),
    ActionType.VerifyTitle.toString(),
    ActionType.VerifyTitleContains.toString(),
    ActionType.VerifyUrl.toString(),
];

export const isPagelessAction = (action: string) => {
    return pagelessActions.includes(action);
};
