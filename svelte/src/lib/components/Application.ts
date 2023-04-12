import type { Action, IRmProjFile } from 'rockmelonqa.common';

export const appActionContextKey = Symbol();

export interface IAppActionContext {
    getOnSaveHandler: (contentIndex: number) => OnSaveHandler | undefined;
    loadProject: (projectFile: IRmProjFile) => void;
    openFile: (relativeFilePath: string) => void;
    registerOnSaveHandler: (contentIndex: number, func: OnSaveHandler) => void;
    showCodeGenerationDialog: Action;
    showNewProjectDialog: Action;
    showRunTestDialog: Action;
    unregisterOnSaveHandler: (contentIndex: number) => void;
}

export type OnSaveHandler = () => Promise<boolean>;
