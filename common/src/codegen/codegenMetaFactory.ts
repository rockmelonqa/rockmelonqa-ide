import { AutomationFramework, ISourceProjectMetadata, Language, TestFramework } from "../file-defs";
import { LookupKey, isEqual } from "./codegenFactory";
import { IOutputProjectMetadataProcessor } from "./playwright-charp-common/outputProjectMetadataProcessor";
import { MsTestProjMeta } from "./playwright-csharp-mstest/msTestProjMeta";
import { NunitProjectMeta } from "./playwright-csharp-nunit/nunitProjectMeta";
import { XUnitProjectMeta } from "./playwright-csharp-xunit/xunitProjectMeta";

const registry = new Map<LookupKey, (projMeta: ISourceProjectMetadata) => IOutputProjectMetadataProcessor>();

registry.set([AutomationFramework.Playwright, Language.CSharp, TestFramework.MSTest], (projMeta) => new MsTestProjMeta(projMeta));

registry.set([AutomationFramework.Playwright, Language.CSharp, TestFramework.NUnit], (projMeta) => new NunitProjectMeta(projMeta));

registry.set([AutomationFramework.Playwright, Language.CSharp, TestFramework.xUnit], (projMeta) => new XUnitProjectMeta(projMeta));

//registry.set([AutomationFramework.Playwright, Language.Typescript, undefined], (projMeta) => new PlaywrightCsharpXUnitCodeGen(projMeta));

export class CodeGenMetaFactory {
  /** Creates new instance of Codegen Meta Generator based on  { automationFramework, testFramework }*/
  static newInstance(projMeta: ISourceProjectMetadata): IOutputProjectMetadataProcessor {
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
