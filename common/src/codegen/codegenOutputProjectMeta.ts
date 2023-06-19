import { IRmProjFile } from "../file-defs";
import { IOutputProjectMetadata } from "./types";

import { CodeGenMetaFactory } from "./codegenMetaFactory";
import { createSourceProjectMetadata } from "./codegenSourceProjectMeta";

export const createOutputProjectMetadata = async (projFile: IRmProjFile): Promise<IOutputProjectMetadata> => {
  const inProjMeta = await createSourceProjectMetadata(projFile);
  const outProjMetaGenerator = CodeGenMetaFactory.newInstance(inProjMeta);
  const outProjMeta = outProjMetaGenerator.createOutputProjectMetadata();
  return outProjMeta;
};
