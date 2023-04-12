import type { ProgressInfo, UpdateDownloadedEvent, UpdateInfo } from 'electron-updater';
import type { Action } from 'rockmelonqa.common';
import { DefaultApiKey } from './shared';

const nameAPI = 'autoUpdater';

const getApi = (apiKey?: string) => {
    return globalThis[(apiKey || DefaultApiKey) as keyof typeof globalThis][nameAPI];
};

const checkForUpdates = (options?: { apiKey?: string }): void => {
    getApi(options?.apiKey).send('checkForUpdates');
};

const onCheckingForUpdate = (fn: () => void, options?: { apiKey?: string }): Action | undefined => {
    return getApi(options?.apiKey).on('checkingForUpdate', fn);
};

const onError = (fn: (error: any) => void, options?: { apiKey?: string }): Action | undefined => {
    return getApi(options?.apiKey).on('errorOnAutoUpdate', fn);
};

const onUpdateAvailable = (fn: (info: UpdateInfo) => void, options?: { apiKey?: string }): Action | undefined => {
    return getApi(options?.apiKey).on('updateAvailable', fn);
};

const onUpdateNotAvailable = (fn: (info: UpdateInfo) => void, options?: { apiKey?: string }): Action | undefined => {
    return getApi(options?.apiKey).on('updateNotAvailable', fn);
};

const onDownloadProgress = (fn: (info: ProgressInfo) => void, options?: { apiKey?: string }): Action | undefined => {
    return getApi(options?.apiKey).on('downloadProgress', fn);
};

const onUpdateDownloaded = (
    fn: (info: UpdateDownloadedEvent) => void,
    options?: { apiKey?: string }
): Action | undefined => {
    return getApi(options?.apiKey).on('updateDownloaded', fn);
};

const startDownloadUpdate = (options?: { apiKey?: string }): void => {
    getApi(options?.apiKey).send('startDownloadUpdate');
};

const quitAndInstall = (options?: { apiKey?: string }): void => {
    getApi(options?.apiKey).send('quitAndInstall');
};

export const autoUpdater = {
    checkForUpdates,
    onCheckingForUpdate,
    onDownloadProgress,
    onError,
    onUpdateAvailable,
    onUpdateDownloaded,
    onUpdateNotAvailable,
    quitAndInstall,
    startDownloadUpdate,
};
