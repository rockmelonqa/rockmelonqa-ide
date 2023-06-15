import { generateCode } from "./codegen";
import { CodeGenMetaFactory } from "./codegenMetaFactory";
import { createOutputProjectMetadata } from "./codegenOutputProjectMeta";
import { createSourceProjectMetadata } from "./codegenSourceProjectMeta";
import { IOutputProjectMetadataProcessor } from "./playwright-charp-common/outputProjectMetadataProcessor";
import { ICodeGen, SourceFileValidationError } from "./types";

export {
  CodeGenMetaFactory,
  createOutputProjectMetadata,
  createSourceProjectMetadata,
  generateCode,
  IOutputProjectMetadataProcessor,
  ICodeGen,
  SourceFileValidationError,
};
