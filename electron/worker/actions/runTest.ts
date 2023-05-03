import path from 'path';
import { Worker } from 'worker_threads';

import {
    IProgressEvent,
    IRmProjFile,
    IRunTestSettings,
    Language,
    StandardFolder,
    TestFramework,
} from 'rockmelonqa.common';
import { MessagePort } from 'worker_threads';
import * as fileSystem from '../../utils/fileSystem';
import { WorkerAction, WorkerMessage } from '../worker';
import { executeCommand, IGenericActionResult } from './shared';
import { CommandBuilderFactory } from './runTest/commandBuilder';

export interface IRunTestContext {
    rmProjFile: IRmProjFile;
    settings: IRunTestSettings;
    storageFolder: string;
}

export type IRunTestActionResult = IGenericActionResult<{
    resultFileName: string;
}>;

export const runTest = async function (
    context: IRunTestContext,
    progressNotify: (event: IProgressEvent) => void
): Promise<IRunTestActionResult> {
    return await new Promise<IRunTestActionResult>((rs, _) => {
        const workerPath = path.join(__dirname, '../worker.js');
        const worker = new Worker(workerPath);

        worker.on('message', (event: IProgressEvent) => {
            if (event.type === 'finish') {
                rs(prepareActionRs(context, { isSuccess: true }));
            } else {
                progressNotify(event);
            }
        });

        worker.on('error', async (error: Error) => {
            console.error(error);
            rs(
                await prepareActionRs(context, {
                    isSuccess: true,
                    errorMessage: String(error),
                })
            );
        });

        worker.postMessage({
            action: WorkerAction.RunTest,
            context,
        } as WorkerMessage);
    });
};

const prepareActionRs = async (context: IRunTestContext, actionRs: IRunTestActionResult): Promise<IRunTestActionResult> => {
    const resultFileName = toResultFileName(context.rmProjFile);
    const fileSystemPath = path.join(context.rmProjFile.folderPath, context.storageFolder, resultFileName);

    // only return result-file-name if it does exist
    if (await fileSystem.checkExists(fileSystemPath)) {
        actionRs.data = { resultFileName: resultFileName };
    }

    return actionRs;
};

export const doRunTest = async (port: MessagePort | null, context: IRunTestContext) => {
    const { settings } = context;
    const { language, testFramework } = context.rmProjFile.content;

    const resultFileName = toResultFileName(context.rmProjFile);
    const resultFilePath = path.join(context.storageFolder, resultFileName);
    let commandBuilder = CommandBuilderFactory.getBuilder(language, testFramework);
    let outputCodeDir = path.join(context.rmProjFile.folderPath, StandardFolder.OutputCode);
    settings.outputCodeDir = outputCodeDir;
    let cmd: string = commandBuilder.build(settings, resultFilePath);

    postMessage(port, { type: 'running-test', log: `Executing: '${cmd}'` });
    const rs = executeCommand(cmd, { cwd: outputCodeDir });
    postMessage(port, { type: 'running-test', log: rs.output });

    postMessage(port, { type: 'finish' });
};

const postMessage = (port: MessagePort | null, event: IProgressEvent) => {
    port?.postMessage(event);
};

const toResultFileName = (rmProjFile: IRmProjFile) => {
    const { language } = rmProjFile.content;
    switch (language) {
        case Language.CSharp:
            return 'test-result.trx';
        case Language.Typescript:
            return 'test-result.json';
        default:
            throw new Error('Language not supported: ' + language);
    }
};
