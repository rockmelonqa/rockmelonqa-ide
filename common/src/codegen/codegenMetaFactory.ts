import { AutomationFramework, ISourceProjectMetadata, Language, TestFramework } from "../file-defs";
import { LookupKey, isEqual } from "./codegenFactory";
import { IOutputProjectMetadataGenerator } from "./playwright-charp-common/outputProjectMetadataProcessor";
import { MsTestProjMetaGenerator } from "./playwright-csharp-mstest/msTestProjMetaGenerator";
import { NunitProjectMetaGenerator } from "./playwright-csharp-nunit/nunitProjectMetaGenerator";
import { XUnitProjectMetaGenerator } from "./playwright-csharp-xunit/xunitProjectMetaGenerator";
import { PlaywrightTypeScriptProjMetaGenerator } from "./playwright-typescript/playwrightTypeScriptMetaGenerator";

/** Registy that contains mapping between LookupKey and a generator function that return ProjectMeta Processor */
const registry = new Map<LookupKey, (projMeta: ISourceProjectMetadata) => IOutputProjectMetadataGenerator>();

registry.set(
  [AutomationFramework.Playwright, Language.CSharp, TestFramework.MSTest],
  (projMeta) => new MsTestProjMetaGenerator(projMeta)
);

registry.set(
  [AutomationFramework.Playwright, Language.CSharp, TestFramework.NUnit],
  (projMeta) => new NunitProjectMetaGenerator(projMeta)
);

registry.set(
  [AutomationFramework.Playwright, Language.CSharp, TestFramework.xUnit],
  (projMeta) => new XUnitProjectMetaGenerator(projMeta)
);

registry.set(
  [AutomationFramework.Playwright, Language.Typescript, ""],
  (projMeta) => new PlaywrightTypeScriptProjMetaGenerator(projMeta)
);

/** Contains factory method that generate new instance of ProjectMeta Processor */
export class CodeGenMetaFactory {
  /** Creates new instance of Codegen Meta Generator based on  { automationFramework, testFramework }*/
  static newInstance(projMeta: ISourceProjectMetadata): IOutputProjectMetadataGenerator {
    const { automationFramework, language, testFramework } = projMeta.project.content;
    const keyToLookup: LookupKey = [automationFramework, language, testFramework];

    for (const [key, value] of registry) {
      if (isEqual(keyToLookup, key)) {
        const codegen = value(projMeta);
        return codegen;
      }
    }

    throw new Error(
      `DEV ERROR: Can't find MetadataProcessor class for [AutomationFramework ${automationFramework}, Language: ${language}, TestFramework: ${projMeta.project.content.testFramework}] '`
    );
  }
}
