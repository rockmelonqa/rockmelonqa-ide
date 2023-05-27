import type { Action, IRmProjFile } from 'rockmelonqa.common';

export const appActionContextKey = Symbol();

export interface IAppActionContext {
    /** Load selected *.rmproj file */
    loadProject: (projectFile: IRmProjFile) => void;

    /** Open selected file in new tab */
    openFile: (relativeFilePath: string) => void;

    // get, add, delete tab-content on-save handler
    getOnSaveHandler: (contentIndex: number) => OnSaveHandler | undefined;
    registerOnSaveHandler: (contentIndex: number, func: OnSaveHandler) => void;
    unregisterOnSaveHandler: (contentIndex: number) => void;
        
    showCodeGenerationDialog: Action;
    showNewProjectDialog: Action;
    showRunTestDialog: Action;

    /** Exit app */
    quit: Action;
}

export type OnSaveHandler = () => Promise<boolean>;
