import os from "os";
import fs from "fs";
import path from "path";
import { createRmTestProject, writeOutputProjectFiles } from "../../test-helpers/rm-project-generator";
import { PlaywrightTypeScriptProjMetaGenerator } from "../../../src/codegen/playwright-typescript/playwrightTypeScriptMetaGenerator";
import { createTempDir } from "../../test-helpers/fsHelpers";
import { normalizeLineEndings } from "../../test-helpers/stringHelpers";
import { generateCode } from "../../../src/codegen";
import { IProgressEvent, Indent } from "../../../src";
import { execSync } from "child_process";
import { TemplateReindenter } from "../../../src/codegen/playwright-csharp-mstest/templateCollection";
const tempDir = path.resolve(__dirname, "../../.tmp");

// Notation
// {IndentChar}/{IndentSize}
// EX
// - {Spaces}/{4}
// - {Spaces}/{2}
// - {Tabs}/{1}

const SOURCE = new Map<string, string>();
SOURCE.set(
  "{Spaces}/{4}",
  `
namespace {{{fullNamespace}}};

/// <summary>
/// {{{description}}}
/// </summary>
public partial class {{{testCaseName}}} : TestCaseBase
{
    public {{{testCaseName}}}(PageTest testSuiteInstance): base(testSuiteInstance) {}

    public async Task RunAsync()
    {
        PageDefinitions defs = new PageDefinitions(this.Page);
        // Test body
{{{body}}}
    }
}`.trimStart()
);

SOURCE.set(
  "{Spaces}/{2}",
  `
namespace {{{fullNamespace}}};

/// <summary>
/// {{{description}}}
/// </summary>
public partial class {{{testCaseName}}} : TestCaseBase
{
  public {{{testCaseName}}}(PageTest testSuiteInstance): base(testSuiteInstance) {}

  public async Task RunAsync()
  {
    PageDefinitions defs = new PageDefinitions(this.Page);
    // Test body
{{{body}}}
  }
}`.trimStart()
);

SOURCE.set(
  "{Tabs}/{1}",
  `
namespace {{{fullNamespace}}};

/// <summary>
/// {{{description}}}
/// </summary>
public partial class {{{testCaseName}}} : TestCaseBase
{
	public {{{testCaseName}}}(PageTest testSuiteInstance): base(testSuiteInstance) {}

	public async Task RunAsync()
	{
		PageDefinitions defs = new PageDefinitions(this.Page);
		// Test body
{{{body}}}
	}
}`.trimStart()
);

const cases = [
  //["{Spaces}/{4}", "{Spaces}/{2}"],
  //["{Spaces}/{2}", "{Spaces}/{4}"],
  //["{Spaces}/{2}", "{Tabs}/{1}"],
  ["{Tabs}/{1}", "{Spaces}/{2}"],
];
const regex = /\{(.+)\}\/\{(\d+)\}/;
test.each(cases)("Test: From %p to %p", (from, to) => {
  const fromStr = SOURCE.get(from);
  if (!fromStr) throw new Error("`from` key doesn't exist in SOURCE: " + from);

  const fromParts = regex.exec(from);
  if (!fromParts) throw new Error("Invalid `from`: " + from);

  const [_, sourceIndentStr, sourceIndentSizeStr] = fromParts;
  const sourceIndent = sourceIndentStr as unknown as Indent;
  const sourceIndentSize = parseInt(sourceIndentSizeStr);

  const toStr = SOURCE.get(to);
  if (!toStr) throw new Error("`to` key doesn't exist in SOURCE: " + to);
  const toParts = regex.exec(to);
  if (!toParts) throw new Error("Invalid `to`: " + to);

  const [__, requiredIndentStr, requiredIndentSizeStr] = toParts;
  const requiredIndent = requiredIndentStr as unknown as Indent;
  const requiredIndentSize = parseInt(requiredIndentSizeStr);

  const reindenter = new TemplateReindenter(sourceIndent, sourceIndentSize, requiredIndent, requiredIndentSize);
  const actualReindented = reindenter.reindentContent(fromStr);

  const actualReindentedNormalized = normalizeLineEndings(actualReindented);
  const expectedReindentNormalized = normalizeLineEndings(toStr);

  expect(actualReindentedNormalized).toBe(expectedReindentNormalized);
});
