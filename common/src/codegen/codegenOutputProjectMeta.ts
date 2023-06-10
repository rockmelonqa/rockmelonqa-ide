import { IRmProjFile } from "../file-defs";
import { IOutputProjectMetadata } from "./types";

import { CodeGenMetaFactory } from "./codegenMetaFactory";
import { createSourceProjectMetadata } from "./codegenSourceProjectMeta";

export const createOutputProjectMetadata = async (projFile: IRmProjFile): Promise<IOutputProjectMetadata> => {
  const inProjMeta = await createSourceProjectMetadata(projFile);
  const outProjMeta = CodeGenMetaFactory.newInstance(inProjMeta);
  const meta = outProjMeta.createOutputProjectMetadata();
  return meta;
};
