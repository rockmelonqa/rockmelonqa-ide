import { ISourceProjectMetadata, ITestCase, ITestRoutine, ITestSuite } from "../../file-defs";
import { IPage } from "../../file-defs/pageFile";
import { DotnetTestProjectMetaGenerator } from "../playwright-charp-common/dotnetTestProjectMetaGenerator";
import { IOutputProjectMetadataGenerator, MapCreator } from "../playwright-charp-common/outputProjectMetadataProcessor";
import { IOutputFileInfo, IOutputProjectMetadata } from "../types";

/** MsTest project meta generator */
export class MsTestProjMetaGenerator extends DotnetTestProjectMetaGenerator implements IOutputProjectMetadataGenerator {
  /** Creates new instance of MsTestProjMetaGenerator with the provided source project metadata */
  constructor(codegenMeta: ISourceProjectMetadata) {
    super(codegenMeta);
  }
  /** Creates Output Project Metadata */
  public createOutputProjectMetadata(): IOutputProjectMetadata {
    return this.createDotnetProjectMetadata();
  }
}
