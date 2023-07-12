import path from "path";
import { normalizeLineEndings } from "../../test-helpers/stringHelpers";
import { Indent } from "../../../src";
import { TemplateReindenter } from "../../../src/codegen/playwright-csharp-mstest/templateCollection";

// ############################################
// # Test the conversion of indentations
// ############################################

// Concept:
// An indentation of a file is specified with 2 values:
// - IndentChar: the character that is used as indentation, could be whitespaces or tabs
// - IndentSize: the size of the indent, could be any integer value, 1 , 2 , 4,...
// Notation:
// In these tests, we use this notation to indicate indentation of a file
// {IndentChar}/{IndentSize}
// EX
// - {Spaces}/{4}
// - {Spaces}/{2}
// - {Tabs}/{1}

/** Contains sample source code with different indentation. We then have some tests for converting one indentation to another */
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

/** The collection of test cases.
 * Each case is a tupple of [ConvertFrom, ConvertTo] to indicate that we want to convert one indentation to another.
 * (we might wanna use a "permutation" generator instead of listing the tupples manually) */
const cases = [
  ["{Spaces}/{4}", "{Spaces}/{2}"],
  ["{Spaces}/{2}", "{Spaces}/{4}"],
  ["{Spaces}/{2}", "{Tabs}/{1}"],
  ["{Tabs}/{1}", "{Spaces}/{2}"],
];

/** Regex to match the notation string */
const regex = /\{(.+)\}\/\{(\d+)\}/;

test.each(cases)("Test: From %p to %p", (from, to) => {
  const fromStr = SOURCE.get(from);
  if (!fromStr) throw new Error(`"from" key ${from} doesn't exist in SOURCE`);
  const fromParts = regex.exec(from);
  if (!fromParts) throw new Error("Invalid `from` key: " + from);

  const [sourceIndentStr, sourceIndentSizeStr] = [fromParts[1], fromParts[2]];
  const sourceIndent = sourceIndentStr as unknown as Indent;
  const sourceIndentSize = parseInt(sourceIndentSizeStr);

  const toStr = SOURCE.get(to);
  if (!toStr) throw new Error(`"to" key ${to} doesn't exist in SOURCE`);
  const toParts = regex.exec(to);
  if (!toParts) throw new Error("Invalid `to` key: " + to);

  const [requiredIndentStr, requiredIndentSizeStr] = [toParts[1], toParts[2]];
  const requiredIndent = requiredIndentStr as unknown as Indent;
  const requiredIndentSize = parseInt(requiredIndentSizeStr);

  const reindenter = new TemplateReindenter(sourceIndent, sourceIndentSize, requiredIndent, requiredIndentSize);
  const actualReindented = reindenter.reindentContent(fromStr);

  const actualReindentedNormalized = normalizeLineEndings(actualReindented);
  const expectedReindentNormalized = normalizeLineEndings(toStr);

  expect(actualReindentedNormalized).toBe(expectedReindentNormalized);
});
