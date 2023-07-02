import { AutomationFramework, ISourceProjectMetadata, TestFramework, Language } from "../file-defs";
import { PlaywrightCsharpMSTestCodeGen } from "./playwright-csharp-mstest/playwrightCsharpMsTestCodeGen";
import { PlaywrightCsharpNunitCodeGen } from "./playwright-csharp-nunit/playwrightCsharpNunitCodeGen";
import { PlaywrightCsharpXUnitCodeGen } from "./playwright-csharp-xunit/playwrightCsharpXUnitCodeGen";
import { PlaywrightTypeScriptCodeGen } from "./playwright-typescript/playwrightTypescriptCodeGen";
import { ICodeGen } from "./types";

export type LookupKey = [
  automationFramework: AutomationFramework,
  language: Language,
  testFramework: TestFramework | ""
];

export const isEqual = (
  [automationFramework1, language1, testFramework1]: LookupKey,
  [automationFramework2, language2, testFramework2]: LookupKey
) => {
  return automationFramework1 === automationFramework2 && language1 === language2 && testFramework1 === testFramework2;
};

const registry = new Map<LookupKey, (projMeta: ISourceProjectMetadata) => ICodeGen>();

registry.set(
  [AutomationFramework.Playwright, Language.CSharp, TestFramework.MSTest],
  (projMeta) => new PlaywrightCsharpMSTestCodeGen(projMeta)
);

registry.set(
  [AutomationFramework.Playwright, Language.CSharp, TestFramework.NUnit],
  (projMeta) => new PlaywrightCsharpNunitCodeGen(projMeta)
);

registry.set(
  [AutomationFramework.Playwright, Language.CSharp, TestFramework.xUnit],
  (projMeta) => new PlaywrightCsharpXUnitCodeGen(projMeta)
);

registry.set(
  [AutomationFramework.Playwright, Language.Typescript, ""],
  (projMeta) => new PlaywrightTypeScriptCodeGen(projMeta)
);

/** Creates new instance of Codegen based on  { automationFramework, testFramework }*/
export class CodeGenFactory {
  static newInstance(projMeta: ISourceProjectMetadata): ICodeGen {
    const { automationFramework, language, testFramework } = projMeta.project.content;
    const keyToLookup: LookupKey = [automationFramework, language, testFramework];

    for (const [key, value] of registry) {
      if (isEqual(keyToLookup, key)) {
        const codegen = value(projMeta);
        return codegen;
      }
    }

    throw new Error(
      `DEV ERROR: Can't find Codegen class for [AutomationFramework ${automationFramework}, Language: ${language}, TestFramework: ${projMeta.project.content.testFramework}] '`
    );
  }
}
