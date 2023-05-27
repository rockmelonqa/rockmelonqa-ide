import { ActivityType } from "$lib/components/ActivityBar";
import type { ITab } from "$lib/components/Tab/Tab";
import _ from "lodash";
import type { IRmProjFile } from "rockmelonqa.common";
import { writable, type Readable } from "svelte/store";
import { Node } from "../components/FileExplorer/Node";
import type { IPageData, ITestCaseData } from "./AppContext.model";

/**
 * Application level context
 */
export interface IAppState {
    projectFile?: IRmProjFile;
    /** List of page definition data
     * key: page id
     * value: page definition data
     */
    pages: Map<string, IPageData>;

    /** List of test case data
     * key: test case id
     * value: test case data
     */
    testCases: Map<string, ITestCaseData>;

    /** Selection item on Activity Bar */
    activity?: ActivityType;

    /** File Explorer data */
    files: Node[];
    /** Tree (node) path of selected node */
    selectedFile?: string;

    /** Tab list */
    tabs: ITab[];
    activeTabIndex: number; // Be used in most case
    activeTabId?: string; // To subscribe active tab changed, to highlight related file on FileExplorer
}

/**
 * Initial app context values to use on start up to setup types
 */
export const initialAppContext: IAppState = {
    projectFile: undefined,
    pages: new Map<string, IPageData>(),
    testCases: new Map<string, ITestCaseData>(),

    activity: undefined,

    files: [],
    selectedFile: undefined,

    tabs: [],
    activeTabIndex: 0,
    activeTabId: undefined,
};

/**
 * Actions supported
 */
export enum AppActionType {
    LoadProject = "LoadProject",
    UnloadProject = "UnloadProject",
    SetProject = "SetProject",

    SetPageData = "LoadPageData",
    RemovePageData = "RemovePageData",

    SetTestCaseData = "SetTestCaseData",
    RemoveTestCaseData = "RemoveTestCaseData",

    /** Set the selection on Activity Bar */
    SetActivity = "SetActivity",

    /** Set the file hierarchy for File Explorer */
    SetFiles = "SetFiles",
    /** Update node info on File Explorer */
    UpdateFile = "UpdateFile",
    /** Set the selected node on File Explorer */
    SelectFile = "SelectFile",

    AddTab = "AddTab",
    CloseTab = "CloseTab",
    CloseTabs = "CloseTabs",
    SelectTab = "SelectTab",
    UpdateTab = "UpdateTab",
    SetTabDirty = "SetTabDirty",
}

/**
 * Actions that can be performed on a state
 */
export type AppAction =
    | { type: AppActionType.LoadProject; projectFile: IRmProjFile }
    | { type: AppActionType.UnloadProject }
    | { type: AppActionType.SetProject; projectFile: IRmProjFile }
    | { type: AppActionType.SetPageData; data: IPageData }
    | { type: AppActionType.RemovePageData; filePath: string }
    | { type: AppActionType.SetTestCaseData; data: ITestCaseData }
    | { type: AppActionType.RemoveTestCaseData; filePath: string }
    | { type: AppActionType.SetActivity; activity?: ActivityType }
    | { type: AppActionType.SetFiles; files: Node[] }
    | { type: AppActionType.UpdateFile; nodePath: string; value: Partial<Node> }
    | { type: AppActionType.SelectFile; nodePath: string | undefined }
    | { type: AppActionType.AddTab; tab: ITab }
    | { type: AppActionType.CloseTab; tabIndex: number }
    | { type: AppActionType.CloseTabs; tabIndexes: number[] }
    | { type: AppActionType.SelectTab; tabIndex: number }
    | { type: AppActionType.UpdateTab; tabIndex: number; value: Partial<ITab> }
    | { type: AppActionType.SetTabDirty; tabIndex: number; isDirty: boolean };

/**
 * Reducer function to change state
 *
 * @param state
 * @param action
 */
export function appContextReducer(state: IAppState, action: AppAction): IAppState {
    switch (action.type) {
        case AppActionType.LoadProject: {
            return action.projectFile.folderPath !== state.projectFile?.folderPath
                ? {
                      ...initialAppContext,
                      projectFile: action.projectFile,
                      activity: ActivityType.Files,
                  }
                : { ...state };
        }
        case AppActionType.UnloadProject: {
            return initialAppContext;
        }
        case AppActionType.SetProject:
            return {
                ...state,
                projectFile: action.projectFile,
            };
        case AppActionType.SetPageData: {
            const pages = new Map<string, IPageData>([...state.pages]);
            pages.set(action.data.id, action.data);
            return {
                ...state,
                pages: pages,
            };
        }
        case AppActionType.RemovePageData: {
            const pages = new Map(Array.from(state.pages).filter(([_, value]) => value.filePath !== action.filePath));
            return {
                ...state,
                pages: pages,
            };
        }
        case AppActionType.SetTestCaseData: {
            const testCases = new Map<string, ITestCaseData>([...state.testCases]);
            testCases.set(action.data.id, action.data);
            return {
                ...state,
                testCases: testCases,
            };
        }
        case AppActionType.RemoveTestCaseData: {
            const testCases = new Map(
                Array.from(state.testCases).filter(([_, value]) => value.filePath !== action.filePath)
            );
            return {
                ...state,
                testCases: testCases,
            };
        }
        case AppActionType.SetActivity:
            return {
                ...state,
                activity: action.activity,
            };
        case AppActionType.SetFiles:
            return {
                ...state,
                files: Node.sort(action.files),
            };
        case AppActionType.UpdateFile: {
            const files = [...state.files];
            let foundNode = Node.findNodeByPath(files, action.nodePath);
            if (foundNode) {
                foundNode = Object.assign(foundNode, action.value);
            }
            return {
                ...state,
                files: files,
            };
        }
        case AppActionType.SelectFile: {
            return {
                ...state,
                selectedFile: action.nodePath,
            };
        }
        case AppActionType.AddTab: {
            const tabs = [...state.tabs];
            const activeTabIndex = tabs.push(action.tab) - 1;
            return {
                ...state,
                tabs: tabs,
                activeTabIndex: activeTabIndex,
                activeTabId: action.tab.id,
            };
        }
        case AppActionType.CloseTab: {
            // 1. Calculate tab list: remove tab our of list
            const newTabs = [...state.tabs];
            newTabs.splice(action.tabIndex, 1);

            // 2. Calculate active tab index:
            // if close current tab, then activate the recent (last) one
            // if close other tab, try to keep current one active
            const newTabIndex =
                state.activeTabIndex === action.tabIndex
                    ? Math.max(newTabs.length - 1, 0)
                    : state.activeTabIndex < action.tabIndex
                    ? state.activeTabIndex
                    : state.activeTabIndex - 1;
            const newTabId = newTabs.length > 0 ? newTabs[newTabIndex].id : undefined;

            return {
                ...state,
                tabs: newTabs,
                activeTabIndex: newTabIndex,
                activeTabId: newTabId,
            };
        }
        case AppActionType.CloseTabs: {
            const newTabs = [...state.tabs];

            const indexesToRemove = action.tabIndexes.sort((a, b) => b - a);
            indexesToRemove.forEach((index) => newTabs.splice(index, 1));

            const newTabIndex = newTabs.length > 0 ? newTabs.length - 1 : 0;
            const newTabId = newTabs.length > 0 ? newTabs[newTabIndex].id : undefined;

            return {
                ...state,
                tabs: newTabs,
                activeTabIndex: newTabIndex,
                activeTabId: newTabId,
            };
        }
        case AppActionType.SelectTab: {
            return {
                ...state,
                activeTabIndex: action.tabIndex,
                activeTabId: state.tabs[action.tabIndex].id,
            };
        }
        case AppActionType.UpdateTab: {
            const newTabs = [...state.tabs];
            const tabToChange = newTabs[action.tabIndex];
            _.merge(tabToChange, action.value);
            return {
                ...state,
                tabs: newTabs,
            };
        }
        case AppActionType.SetTabDirty: {
            const newTabs = [...state.tabs];
            newTabs[action.tabIndex].isDirty = action.isDirty;
            return {
                ...state,
                tabs: newTabs,
            };
        }
        default:
            return { ...state };
    }
}

/**
 * Application level context
 */
export interface IAppContext {
    state: Readable<IAppState>;
    dispatch: (action: AppAction) => void;
}

/**
 * Call this at startup in the root `__layout.svelte` in order to set the initial locale
 * @returns The intial context
 */
export function createAppContext(): IAppContext {
    const { update, subscribe } = writable({ ...initialAppContext });

    function dispatch(action: AppAction) {
        update((state) => appContextReducer(state, action));
    }

    // Return the context
    return {
        state: { subscribe },
        dispatch,
    };
}

/**
 * Key used to get application context
 */
export const appContextKey = Symbol();
