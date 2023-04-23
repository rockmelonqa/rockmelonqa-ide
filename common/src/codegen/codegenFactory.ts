import { AutomationFramework, ISourceProjectMeta, TestFramework } from "../file-defs";
import { PlaywrightCsharpMSTestCodeGen } from "./playwright-csharp-mstest/playwrightCsharpMsTestCodeGen";
import { PlaywrightCsharpNunitCodeGen } from "./playwright-csharp-nunit/playwrightCsharpNunitCodeGen";
import { PlaywrightCsharpXUnitCodeGen } from "./playwright-csharp-xunit/playwrightCsharpXUnitCodeGen";
import { ICodeGen } from "./types";

const registy: { [key in keyof typeof AutomationFramework]?: { [key in keyof typeof TestFramework]?: any } } = {
  [AutomationFramework.Playwright]: {
    [TestFramework.NUnit]: PlaywrightCsharpNunitCodeGen,
    [TestFramework.MSTest]: PlaywrightCsharpMSTestCodeGen,
    [TestFramework.xUnit]: PlaywrightCsharpXUnitCodeGen,
    // ... add other types of TestFramework
  },
  // ... add other types of AutomationFramework
};

/** Creates new instance of Codegen based on  { automationFramework, testFramework }*/
export class CodeGenFactory {
  static newInstance(projMeta: ISourceProjectMeta): ICodeGen {
    let automationFramework = registy[projMeta.project.content.automationFramework];

    if (automationFramework === undefined) {
      throw new Error(`Can't find Codegen for AutomationFramework '${projMeta.project.content.automationFramework}'`);
    }

    let codegenClass = automationFramework[projMeta.project.content.testFramework];
    if (!codegenClass) {
      throw new Error(`Can't find Codegen class for TestFramework '${projMeta.project.content.testFramework}'`);
    }

    return new codegenClass(projMeta);
  }
}
