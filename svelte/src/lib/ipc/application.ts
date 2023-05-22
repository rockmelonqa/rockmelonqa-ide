import type {
    Action,
    IAppInfo,
    IEnvironmentInfo,
    IIpcGenericResponse,
    IIpcResponse,
    IRmProjFile,
    IUserSettings,
} from 'rockmelonqa.common';
import { DefaultApiKey } from './shared';

const nameAPI = 'application';

const getApi = (apiKey?: string) => {
    return globalThis[(apiKey || DefaultApiKey) as keyof typeof globalThis][nameAPI];
};

const getAppInfo = async (options?: { apiKey?: string }): Promise<IAppInfo> => {
    return await getApi(options?.apiKey).invoke('getAppInfo');
};

const getUserSettings = async (options?: { apiKey?: string }): Promise<IUserSettings> => {
    return await getApi(options?.apiKey).invoke('getUserSettings');
};

const setUserSettings = (data: IUserSettings, options?: { apiKey?: string }) => {
    getApi(options?.apiKey).send('setUserSettings', data);
};

const createNewProject = async (model: IRmProjFile, options?: { apiKey?: string }): Promise<IIpcResponse> => {
    return await getApi(options?.apiKey).invoke('createNewProject', model);
};

const openProject = (options?: { apiKey?: string }) => {
    getApi(options?.apiKey).send('openProject');
};

const onLoadProject = (
    fn: (model: IIpcGenericResponse<IRmProjFile>) => void,
    options?: { apiKey?: string }
): Action | undefined => {
    return getApi(options?.apiKey).on('loadProject', fn);
};

const onProjectLoaded = (    
    options?: { apiKey?: string }
): Action | undefined => {
    debugger;
    return getApi(options?.apiKey).invoke('onProjectLoaded');
};

const onQuit = (fn: Action, options?: { apiKey?: string }): Action | undefined => {
    return getApi(options?.apiKey).on('quit', fn);
};

const onCloseProject = (fn: Action, options?: {apiKey?: string}) : Action | undefined => {
    return getApi(options?.apiKey).on('closeProject', fn);
};

/**
 * Get path separator based on OS
 */
const getEnvironmentInfo = async (options?: { apiKey?: string }): Promise<IEnvironmentInfo> => {
    return await getApi(options?.apiKey).invoke('getEnvironmentInfo');
};

export const application = {
    getAppInfo,
    getEnvironmentInfo,
    getUserSettings,
    setUserSettings,
    createNewProject,
    openProject,
    onLoadProject,
    onProjectLoaded,
    onQuit,
    onCloseProject
};
