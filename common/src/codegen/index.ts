import { generateCode } from "./codegen";
import { CodeGenMetaFactory } from "./codegenMetaFactory";
import { createOutputProjectMetadata } from "./codegenOutputProjectMeta";
import { createSourceProjectMetadata } from "./codegenSourceProjectMeta";
import { IOutputProjectMetadataGenerator } from "./playwright-charp-common/outputProjectMetadataProcessor";
import { ICodeGen } from "./types";

export {
  CodeGenMetaFactory,
  createOutputProjectMetadata,
  createSourceProjectMetadata,
  generateCode,
  IOutputProjectMetadataGenerator as IOutputProjectMetadataProcessor,
  ICodeGen,
};
