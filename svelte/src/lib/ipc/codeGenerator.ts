import type {
    Action,
    IIpcGenericResponse,
    IOutputProjectMetadata,
    IProgressDetail,
    IRmProjFile,
} from 'rockmelonqa.common';
import type { ISourceProjectMeta } from 'rockmelonqa.common/file-defs/sourceProjectMeta';
import { DefaultApiKey } from './shared';

const nameAPI = 'codeGenerator';

const getApi = (apiKey?: string) => {
    return globalThis[(apiKey || DefaultApiKey) as keyof typeof globalThis][nameAPI];
};

const genCode = (rmprojFile: IRmProjFile, options?: { apiKey?: string }) => {
    getApi(options?.apiKey).send('genCode', rmprojFile);
};

const onValidateInput = (fn: (data: IProgressDetail) => void, options?: { apiKey?: string }): Action | undefined =>
    getApi(options?.apiKey).on('gen-code:validate-input', fn);

const onParseData = (fn: (data: IProgressDetail) => void, options?: { apiKey?: string }): Action | undefined =>
    getApi(options?.apiKey).on('gen-code:parse-data', fn);

const onCleanFolder = (fn: (data: IProgressDetail) => void, options?: { apiKey?: string }): Action | undefined =>
    getApi(options?.apiKey).on('gen-code:clean-folder', fn);

const onGenerateCode = (fn: (data: IProgressDetail) => void, options?: { apiKey?: string }): Action | undefined =>
    getApi(options?.apiKey).on('gen-code:generate-code', fn);

const onBuild = (fn: (data: IProgressDetail) => void, options?: { apiKey?: string }): Action | undefined =>
    getApi(options?.apiKey).on('build:build', fn);

const onInstallDependencies = (
    fn: (data: IProgressDetail) => void,
    options?: { apiKey?: string }
): Action | undefined => getApi(options?.apiKey).on('build:install-dependencies', fn);

const onFinish = (
    fn: (data: IIpcGenericResponse<{ logFile: string }>) => void,
    options?: { apiKey?: string }
): Action | undefined => getApi(options?.apiKey).on('finish', fn);

/**
 * Get list of invalid prerequisites for code generation
 */
const prerequire = async (rmprojFile: IRmProjFile, options?: { apiKey?: string }): Promise<string[]> => {
    return await getApi(options?.apiKey).invoke('prerequire', rmprojFile);
};

/** Gen metadata of all test suites */
const generateProjectMetadata = async (
    projFile: IRmProjFile,
    options?: { apiKey?: string }
): Promise<ISourceProjectMeta | null> => {
    const response = await getApi(options?.apiKey).invoke('generateSourceProjectMeta', projFile);
    if (response.isSuccess) {
        return response.data;
    } else {
        console.error(`Cannot generate source project metadata. ${response.errorMessage}`);
        return null;
    }
};

/** Get metadata of all test suites */
const getOutputProjectMetadata = async (
    projFile: IRmProjFile,
    options?: { apiKey?: string }
): Promise<IOutputProjectMetadata> => {
    const response = await getApi(options?.apiKey).invoke('getOutputProjectMetadata', projFile);
    if (response.isSuccess) {
        return response.data;
    } else {
        console.error(`Cannot get output project metadata. ${response.errorMessage}`);
        return { suites: [] };
    }
};

export const codeGenerator = {
    genCode,
    getOutputProjectMetadata,
    generateProjectMetadata,
    onBuild,
    onCleanFolder,
    onFinish,
    onGenerateCode,
    onInstallDependencies,
    onParseData,
    onValidateInput,
    prerequire,
};
