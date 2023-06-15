import type { Action, IIpcGenericResponse, IProgressDetail } from "rockmelonqa.common";
import type { IRunTestRequest, IRunTestResponseData } from "rockmelonqa.common/ipc-defs";
import { DefaultApiKey } from "./shared";

const nameAPI = "testRunner";

const getApi = (apiKey?: string) => {
    return globalThis[(apiKey || DefaultApiKey) as keyof typeof globalThis][nameAPI];
};

const runTest = (data: IRunTestRequest, options?: { apiKey?: string }) => {
    console.log("runTest() data", data);
    getApi(options?.apiKey).send("runTest", data);
};

const onRunningTest = (fn: (data: IProgressDetail) => void, options?: { apiKey?: string }): Action | undefined =>
    getApi(options?.apiKey).on("running-test", fn);

const onFinish = (
    fn: (data: IIpcGenericResponse<IRunTestResponseData>) => void,
    options?: { apiKey?: string }
): Action | undefined => getApi(options?.apiKey).on("finish", fn);

export const testRunner = {
    runTest,
    onRunningTest,
    onFinish,
};
