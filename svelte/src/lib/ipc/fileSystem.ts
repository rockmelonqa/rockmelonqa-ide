import type {
    Action,
    IAddFileWatchEventArgs,
    IFileSystemInfo,
    IGetFolderRequest,
    IIpcResponse,
    IRenameFileRequest,
    IWriteFileRequest,
} from "rockmelonqa.common";
import { DefaultApiKey } from "./shared";

const nameAPI = "fileSystem";

const getApi = (apiKey?: string) => {
    return globalThis[(apiKey || DefaultApiKey) as keyof typeof globalThis][nameAPI];
};

/**
 * Create new folder
 */
const createFolder = (folderPath: string, options?: { apiKey?: string }): void => {
    getApi(options?.apiKey).send("createFolder", folderPath);
};

/**
 * Delete file or folder at given path
 */
const deleteFileSystem = async (path: string, options?: { apiKey?: string }): Promise<IIpcResponse> => {
    return await getApi(options?.apiKey).invoke("deleteFileSystem", path);
};

/**
 * Gets clone file path with Windows copy/paste file in-place convention
 */
const getCloneFilePath = async (filePath: string, options?: { apiKey?: string }): Promise<string> => {
    return await getApi(options?.apiKey).invoke("getCloneFilePath", filePath);
};
/**
 * Get folder info
 */
const getFolder = async (
    folderPath: string,
    includeChildren?: boolean,
    options?: { apiKey?: string }
): Promise<IFileSystemInfo | null> => {
    return await getApi(options?.apiKey).invoke("getFolder", {
        path: folderPath,
        includeChildren,
    } as IGetFolderRequest);
};

/**
 * Invoke OS folder picker to select a folder
 */
const pickFolder = async (options?: { apiKey?: string }): Promise<string | void> => {
    return await getApi(options?.apiKey).invoke("pickFolder");
};

/**
 * Read file content as text
 */
const readFile = async (filePath: string, options?: { apiKey?: string }): Promise<string | null> => {
    return await getApi(options?.apiKey).invoke("readFile", filePath);
};

/**
 * Rename file system
 */
const rename = async (oldPath: string, newPath: string, options?: { apiKey?: string }): Promise<IIpcResponse> => {
    return await getApi(options?.apiKey).invoke("rename", { oldPath, newPath } as IRenameFileRequest);
};

/**
 * Get children file system (folder/file) of given path
 */
const walkFolder = async (folderPath: string, options?: { apiKey?: string }): Promise<IFileSystemInfo[]> => {
    const response = await getApi(options?.apiKey).invoke("walkFolder", folderPath);
    if (response.isSuccess) {
        return response.data;
    } else {
        console.error(`Cannot walk folder '${folderPath}'. ${response.errorMessage}`);
        return [];
    }
};

/**
 * Watch file system change at give path
 */
const watch = (path: string, options?: { apiKey?: string }): void => {
    getApi(options?.apiKey).send("watch", path);
};

/**
 * Handle 'File:Add' event
 */

const onWatchAdd = (fn: (data: IAddFileWatchEventArgs) => void, options?: { apiKey?: string }): Action | undefined => {
    return getApi(options?.apiKey).on("watch:add", fn);
};

/**
 * Handle 'File:Remove' event
 */
const onWatchUnlink = (fn: (path: string) => void, options?: { apiKey?: string }): Action | undefined => {
    return getApi(options?.apiKey).on("watch:unlink", fn);
};

/**
 * Handle 'Directory:Add' event
 */
const onWatchAddDir = (fn: (path: string) => void, options?: { apiKey?: string }): Action | undefined => {
    return getApi(options?.apiKey).on("watch:addDir", fn);
};

/**
 * Handle 'Directory:Remove' event
 */
const onWatchUnlinkDir = (fn: (path: string) => void, options?: { apiKey?: string }): Action | undefined => {
    return getApi(options?.apiKey).on("watch:unlinkDir", fn);
};

/**
 * Handle 'File:Change' event
 */
const onWatchChange = (fn: (path: string) => void, options?: { apiKey?: string }): Action | undefined => {
    return getApi(options?.apiKey).on("watch:change", fn);
};

/**
 * Write text file
 * @param filePath
 * @param fileContent
 */
const writeFile = async (filePath: string, fileContent: string, options?: { apiKey?: string }): Promise<void> => {
    await getApi(options?.apiKey).invoke("writeFile", { filePath, fileContent } as IWriteFileRequest);
};

export const fileSystem = {
    createFolder,
    deleteFileSystem,
    getCloneFilePath,
    getFolder,
    pickFolder,
    readFile,
    rename,
    walkFolder,
    watch,
    onWatchAdd,
    onWatchChange,
    onWatchUnlink,
    onWatchAddDir,
    onWatchUnlinkDir,
    writeFile,
};
