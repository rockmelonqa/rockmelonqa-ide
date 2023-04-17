import { AutomationFramework, Indent, IRmProj, ITestCase, ITestSuite, Language, LocatorType, TestFramework } from "../../../src/file-defs";
import { RmpSpec } from "../../test-helpers/rm-project-spec.types";
import { commonNunitOutputFiles } from "../../test-helpers/common-files-dotnet";

export const createPlaywrightXUnitTestData = (): RmpSpec => {
  return {
    projectName: "rm-playwright-csharp-xunit",
    content: {
      fileVersion: 1,
      name: "",
      description: "",
      automationFramework: AutomationFramework.Playwright,
      testFramework: TestFramework.xUnit,
      language: Language.CSharp,
      rootNamespace: "",
      indent: Indent.Spaces,
      indentSize: 4,
    },
    pages: [
      {
        id: "",
        name: "actions/InputPage",
        description: "Input Page",
        elements: [
          {
            id: "",
            type: "pageElement",
            name: "input",
            findBy: LocatorType.Css,
            locator: "input",
            description: "Input",
          },
        ],
      },
    ],
    testcases: [
      {
        id: "",
        name: "input",
        description: "Do input",
        steps: [
          {
            id: "",
            type: "testStep",
            page: "",
            element: "",
            action: "GoToUrl",
            data: "http://localhost:3000/actions/input.html",
          },
          {
            id: "",
            type: "testStep",
            page: "actions/InputPage",
            element: "input",
            action: "Input",
            data: "Hello World",
          },
        ],
      },
    ],
    testsuites: [
      {
        id: "",
        name: "home",
        description: "HomePage test suite",
        testcases: ["input"],
      },
    ],

    outputFiles: [
      ...commonNunitOutputFiles,
      {
        fileRelPath: "PageDefinitions.cs",
        fileContent: `
using AutomationTests.Pages;

namespace AutomationTests;

public class PageDefinitions
{
    public IPage Page { get; private set; }

    public HomePage HomePage { get; private set; }
    public Popup_AdsPage Popup_AdsPage { get; private set; }
    public SearchResultPage SearchResultPage { get; private set; }

    public PageDefinitions(IPage page)
    {
        Page = page;

        HomePage = new HomePage(page);
        Popup_AdsPage = new Popup_AdsPage(page);
        SearchResultPage = new SearchResultPage(page);
    }
}`.trim(),
      },
      {
        fileRelPath: "Pages/HomePage.cs",
        fileContent: `
namespace AutomationTests.Pages;

/// <summary>
/// Home page
/// </summary>
public class HomePage
{
    private IPage _page;

    /// <summary>
    /// Default constructor
    /// </summary>
    /// <param name="page">Playwright Page</param>
    public HomePage(IPage page)
    {
        this._page = page;
    }

    /// <summary>
    /// Search box
    /// </summary>
    public ILocator SearchBox()
    {
        return this._page.Locator("[name=\\"q\\"]");
    }

    /// <summary>
    /// Search button
    /// </summary>
    public ILocator SearchButton()
    {
        return this._page.Locator("div:not([jsname])>center>input[name=\\"btnK\\"]");
    }

    /// <summary>
    /// Search button on the suggestion box
    /// </summary>
    public ILocator SearchButtonOnSuggestionBox()
    {
        return this._page.Locator("div[jsname]>center>input[name=\\"btnK\\"]");
    }
}
        `.trim(),
      },
      {
        fileRelPath: "Pages/Popup_AdsPage.cs",
        fileContent: `
namespace AutomationTests.Pages;

/// <summary>
/// Ads Popup
/// </summary>
public class Popup_AdsPage
{
    private IPage _page;

    /// <summary>
    /// Default constructor
    /// </summary>
    /// <param name="page">Playwright Page</param>
    public Popup_AdsPage(IPage page)
    {
        this._page = page;
    }


}
        `.trim(),
      },
      {
        fileRelPath: "Pages/SearchResultPage.cs",
        fileContent: `
namespace AutomationTests.Pages;

/// <summary>
/// Search result page
/// </summary>
public class SearchResultPage
{
    private IPage _page;

    /// <summary>
    /// Default constructor
    /// </summary>
    /// <param name="page">Playwright Page</param>
    public SearchResultPage(IPage page)
    {
        this._page = page;
    }

    /// <summary>
    /// The visible Search box
    /// </summary>
    public ILocator SearchBox()
    {
        return this._page.Locator("input[name=\\"q\\"][type=\\"text\\"]");
    }

    /// <summary>
    /// The hidden Search box
    /// </summary>
    public ILocator HiddenSearchBox()
    {
        return this._page.Locator("input[name=\\"q\\"][type=\\"hidden\\"]");
    }
}
        `.trim(),
      },
      {
        fileRelPath: "Tests/HomeTestSuite.cs",
        fileContent: `
namespace AutomationTests.Tests;

/// <summary>
/// HomePage test suite
/// </summary>
[TestFixture]
public partial class HomeTestSuite : PageTest
{
    /// <summary>
    /// Search for 'playwright'
    /// </summary>
    [Test]
    public async Task SearchForPlaywrightTestCase()
    {
        PageDefinitions defs = new PageDefinitions(this.Page);

        await Page.GotoAsync("https://www.google.com/");
        await defs.HomePage.SearchBox().FillAsync("playwright");

        // Click the search button on the suggest box
        await defs.HomePage.SearchButtonOnSuggestionBox().ClickAsync();
        await Expect(Page).ToHaveTitleAsync(new System.Text.RegularExpressions.Regex("playwright"));

        // Expecting the hidden search box to make the test effectively waits for search result page to load
        await Expect(defs.SearchResultPage.HiddenSearchBox()).ToHaveValueAsync("playwright");
        await Expect(defs.SearchResultPage.SearchBox()).ToHaveValueAsync("playwright");
    }
}
        `.trim(),
      },
    ],
  };
};