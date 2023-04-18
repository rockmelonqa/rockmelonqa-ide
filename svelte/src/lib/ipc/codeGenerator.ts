import type { Action, ICodeGenMeta, IIpcGenericResponse, IProgressDetail, IRmProjFile } from "rockmelonqa.common";
import type { ITestSuitesMetadata } from "rockmelonqa.common/codegen/playwright-charp/testSuiteMetadata";
import { DefaultApiKey } from "./shared";

const nameAPI = "codeGenerator";

const getApi = (apiKey?: string) => {
  return globalThis[(apiKey || DefaultApiKey) as keyof typeof globalThis][nameAPI];
};

const genCode = (rmprojFile: IRmProjFile, options?: { apiKey?: string }) => {
  getApi(options?.apiKey).send("genCode", rmprojFile);
};

const onValidateInput = (fn: (data: IProgressDetail) => void, options?: { apiKey?: string }): Action | undefined =>
  getApi(options?.apiKey).on("gen-code:validate-input", fn);

const onParseData = (fn: (data: IProgressDetail) => void, options?: { apiKey?: string }): Action | undefined =>
  getApi(options?.apiKey).on("gen-code:parse-data", fn);

const onCleanFolder = (fn: (data: IProgressDetail) => void, options?: { apiKey?: string }): Action | undefined =>
  getApi(options?.apiKey).on("gen-code:clean-folder", fn);

const onGenerateCode = (fn: (data: IProgressDetail) => void, options?: { apiKey?: string }): Action | undefined =>
  getApi(options?.apiKey).on("gen-code:generate-code", fn);

const onBuild = (fn: (data: IProgressDetail) => void, options?: { apiKey?: string }): Action | undefined =>
  getApi(options?.apiKey).on("build:build", fn);

const onInstallDependencies = (
  fn: (data: IProgressDetail) => void,
  options?: { apiKey?: string }
): Action | undefined => getApi(options?.apiKey).on("build:install-dependencies", fn);

const onFinish = (
  fn: (data: IIpcGenericResponse<{ logFile: string }>) => void,
  options?: { apiKey?: string }
): Action | undefined => getApi(options?.apiKey).on("finish", fn);

/**
 * Get list of invalid prerequisites for code generation
 */
const prerequire = async (rmprojFile: IRmProjFile, options?: { apiKey?: string }): Promise<string[]> => {
  return await getApi(options?.apiKey).invoke("prerequire", rmprojFile);
};

/** Gen metadata of all test suites */
const generateProjectMetadata = async (
  projFile: IRmProjFile,
  options?: { apiKey?: string }
): Promise<ICodeGenMeta | null> => {
  const response = await getApi(options?.apiKey).invoke("generateProjectMetadata", projFile);
  if (response.isSuccess) {
    return response.data;
  } else {
    console.error(`Cannot generate codegen metadata. ${response.errorMessage}`);
    return null;
  }
};

/** Get metadata of all test suites */
const getSuitesMetadata = async (
  projFile: IRmProjFile,
  options?: { apiKey?: string }
): Promise<ITestSuitesMetadata> => {
  const response = await getApi(options?.apiKey).invoke("getSuitesMetadata", projFile);
  if (response.isSuccess) {
    return response.data;
  } else {
    console.error(`Cannot get suites metadata. ${response.errorMessage}`);
    return { suites: [] };
  }
};

export const codeGenerator = {
  genCode,
  getSuitesMetadata,
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
