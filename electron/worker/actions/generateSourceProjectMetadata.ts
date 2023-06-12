import path from 'path';
import { Worker } from 'worker_threads';

import { IProgressEvent, IRmProjFile } from 'rockmelonqa.common';
import { createSourceProjectMetadata } from 'rockmelonqa.common/codegen/codegenSourceProjectMeta';
import { MessagePort } from 'worker_threads';
import { WorkerAction, WorkerMessage } from '../worker';
import { IActionResult } from './shared';

export const generateSourceProjectMetadata = async function (rmprojFile: IRmProjFile): Promise<IActionResult> {
  return await new Promise<IActionResult>((rs, _) => {
    const workerPath = path.join(__dirname, '../worker.js');
    const worker = new Worker(workerPath);

    worker.on('message', (event: IProgressEvent) => {
      if (event.type === 'finish') {
        rs({ isSuccess: true, data: event.data });
      }
    });

    worker.on('error', (error: Error) => {
      console.error(error);
      rs({ isSuccess: false, errorMessage: String(error) });
    });

    worker.postMessage({
      action: WorkerAction.GenProjectMetadata,
      rmProjectFile: rmprojFile,
    } as WorkerMessage);
  });
};

export const doGenerateSourceProjectMetadata = async (port: MessagePort | null, rmProjectFile: IRmProjFile) => {
  const meta = await createSourceProjectMetadata(rmProjectFile, (event: IProgressEvent) => port?.postMessage(event));

  port?.postMessage({ type: 'finish', data: meta } as IProgressEvent);
};
