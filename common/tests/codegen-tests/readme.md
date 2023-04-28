# Integration tests for CodeGen

Each file in this folder tests one CodeGen class.

Before running the CodeGen, the test prepare this folder in system TEMP directory: `rockmelon-sample-rmproj/00000000_000000_playwright-csharp-mstest`. In that folder we have

- A `rmproj` folder: contains the source RM Project
- A `result` folder: contains the output test project

The CodeGen generate the test project into `rmproj/output-code`.

The test then perform comparison the `rmproj/output-code` folder and the `result` folder.

# How to write more CodeGen tests

Here is a typical test.

```
test("Run CodeGen Playwright Typescript Jest - Google", async () => {
  // Arrange
  const tmpDir = createTempDir("playwright-typescript-jest");
  const projSpec = createSimpleGoogleTestSpec();
  const copyToDir = path.join(tmpDir, "rmproj");
  fs.mkdirSync(copyToDir);
  const projFile = prepareProject(projSpec, copyToDir);

  const sampleOutputDir = path.join(tmpDir, "result");
  fs.mkdirSync(sampleOutputDir);
  prepareOutputProject(projSpec.outputFiles, sampleOutputDir);

  // Act
  await CodeGen.generateCode(projFile, (event: IProgressEvent) => console.log(event));

  // Assert
  doAssert(path.join(projFile.folderPath, StandardFolder.OutputCode), sampleOutputDir);
});
```

You should provide a unique name for the `tmpDir`;

Write a new method to generate the testSpec then use that method to generate `projSpec`. The `createSimpleGoogleTestSpec()` method is an example.

The rest of the test is ready to run.

# To to generate testSpec (projSpec)

`projSpec` is NOT the RmProjFile. It is short specification of the RmProjFile. The test will translate that `projSpec` into RmProjFile and write all the source RM project file to disk before running the CodeGen.

Sample of testSpec

```

{
    // Name of the rm project file
    projectName: "google-test",

    content: {
      fileVersion: 1,
      name: "",
      description: "",
      automationFramework: AutomationFramework.Playwright,
      testFramework: TestFramework.MSTest,
      language: Language.CSharp,
      rootNamespace: "",
      indent: Indent.Spaces,
      indentSize: 4,
    },
    pages: [
      {
        id: "",
        name: "home",
        description: "Home page",
        elements: [
          {
            id: "",
            type: "pageElement",
            name: "searchBox",
            findBy: LocatorType.Css,
            locator: '[name="q"]',
            description: "Search box",
          },
          {
            id: "",
            type: "pageElement",
            name: "searchButton",
            findBy: LocatorType.Css,
            locator: 'div:not([jsname])>center>input[name="btnK"]',
            description: "Search button",
          },
          {
            id: "",
            type: "pageElement",
            name: "searchButtonOnSuggestionBox",
            findBy: LocatorType.Css,
            locator: 'div[jsname]>center>input[name="btnK"]',
            description: "Search button on the suggestion box",
          },
        ],
      },
      {
        id: "",
        name: "searchResult",
        description: "Search result page",
        elements: [
          {
            id: "",
            type: "pageElement",
            name: "searchBox",
            findBy: LocatorType.Css,
            locator: 'input[name="q"][type="text"]',
            description: "The visible Search box",
          },
          {
            id: "",
            type: "pageElement",
            name: "hiddenSearchBox",
            findBy: LocatorType.Css,
            locator: 'input[name="q"][type="hidden"]',
            description: "The hidden Search box",
          },
        ],
      },
      {
        id: "",
        name: "popup_ads",
        description: "Ads",
        elements: [],
      },
    ],
    testcases: [
      {
        id: "1",
        name: "searchForPlaywright",
        description: "Search for 'playwright'",
        steps: [
          {
            id: "",
            type: "testStep",
            page: "",
            element: "",
            action: "GoToUrl",
            data: "https://www.google.com/",
          },
          {
            id: "",
            type: "testStep",
            page: "home",
            element: "searchBox",
            action: "Input",
            data: "playwright",
          },
          {
            id: "",
            type: "comment",
            comment: "Click the search button on the suggest box",
          },
          {
            id: "",
            type: "testStep",
            page: "home",
            element: "searchButton",
            action: "Click",
            data: "",
          },
          {
            id: "",
            type: "testStep",
            page: "searchResult",
            element: "",
            action: "VerifyTitleContains",
            data: "playwright",
          },
          {
            id: "",
            type: "comment",
            comment: "Expecting the hidden search box to make the test effectively waits for search result page to load",
          },
          {
            id: "",
            type: "testStep",
            page: "searchResult",
            element: "searchBox",
            action: "VerifyHasValue",
            data: "playwright",
          },
          {
            id: "",
            type: "testStep",
            page: "searchResult",
            element: "hiddenSearchBox",
            action: "VerifyHasValue",
            data: "playwright",
          },
        ],
      },
    ],
    testsuites: [
      {
        id: "",
        name: "home",
        description: "HomePage test suite",
        testcases: ["1"],
      },
    ],

    outputFiles: [
      {
        fileRelPath: "AutomationTests.csproj",
        fileContent: `
<Project Sdk="Microsoft.NET.Sdk">
<PropertyGroup>
  <TargetFramework>net6.0</TargetFramework>
  <ImplicitUsings>enable</ImplicitUsings>
  <Nullable>enable</Nullable>
  <IsPackable>false</IsPackable>
  <RootNamespace>AutomationTests</RootNamespace>
  <RunSettingsFilePath>$(MSBuildProjectDirectory)\.runsettings</RunSettingsFilePath>
  <VSTestLogger>trx</VSTestLogger>
  <VSTestResultsDirectory>$(MSBuildProjectDirectory)\TestResults</VSTestResultsDirectory>
</PropertyGroup>

<ItemGroup>
  <PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.4.1" />
  <PackageReference Include="Microsoft.Playwright.MSTest" Version="1.30.0" />
  <PackageReference Include="MSTest.TestAdapter" Version="3.0.2" />
  <PackageReference Include="MSTest.TestFramework" Version="3.0.2" />
</ItemGroup>
</Project>
        `.trim(),
      },
      {
        fileRelPath: ".runsettings",
        fileContent: `
<?xml version="1.0" encoding="utf-8"?>
<RunSettings>
  <Playwright>
    <BrowserName>chromium</BrowserName>
    <LaunchOptions>
      <Headless>false</Headless>
    </LaunchOptions>
  </Playwright>
</RunSettings>
        `.trim(),
      },

      {
        fileRelPath: "LocatorHelper.cs",
        fileContent: `
namespace AutomationTests;

public static class LocatorHelper
{
    public static async Task<string> GetLocatorTagTypeAsync(this ILocator locator)
    {
        return await locator.EvaluateAsync<string>("e => e.tagName");
    }

    /// <summary>
    /// Dyanmic input based on locator tag
    /// </summary>
    /// <param name="locator">Locator name</param>
    /// <param name="data">Data to be input</param>
    public static async Task InputAsync(this ILocator locator, string data)
    {
        string tagName = await locator.GetLocatorTagTypeAsync();
        switch (tagName.ToLower())
        {
            case "input":
                await locator.FillAsync("");
                await locator.TypeAsync(data);
                break;
            case "select":
                await locator.SelectOptionAsync(new SelectOptionValue() { Label = data });
                break;
            default:
                await locator.FillAsync("");
                await locator.TypeAsync(data);
                break;
        }
    }

    /// <summary>
    /// Click outside of element. This will helps Single Page Application sets it states to new value
    /// </summary>
    /// <param name="page">Playwright page</param>
    public static async Task ClickOutsideAsync(this IPage page)
    {
        await page.Locator("xpath=//body >> nth=0").ClickAsync();
    }

    /// <summary>
    /// Helper to detect locator type and call right function
    /// </summary>
    /// <param name="testCase">Test case</param>
    /// <param name="locator">Locator</param>
    /// <param name="data">Data</param>
    public static async Task VerifyAsync(this PlaywrightTest testCase, ILocator locator, string data)
    {
        switch (data.ToLower())
        {
            case "visible":
                await testCase.Expect(locator).ToBeVisibleAsync();
                break;
            case "hidden":
                await testCase.Expect(locator).ToBeHiddenAsync();
                break;
            case "readonly":
                await testCase.Expect(locator).ToBeDisabledAsync();
                break;
            case "edittable":
                await testCase.Expect(locator).ToBeEditableAsync();
                break;
            default:
                // Otherwise we just compare the text contain base on element type
                string tagName = await locator.GetLocatorTagTypeAsync();
                switch (tagName.ToLower())
                {
                    case "input":
                        await testCase.Expect(locator).ToHaveValueAsync(data);
                        break;
                    default:
                        await testCase.Expect(locator).ToHaveTextAsync(data);
                        break;
                }
                break;
        }
    }
}
        `.trim(),
      },
      {
        fileRelPath: "Usings.cs",
        fileContent: `
global using Microsoft.VisualStudio.TestTools.UnitTesting;
global using System.Threading.Tasks;
global using Microsoft.Playwright;
global using Microsoft.Playwright.MSTest;
        `.trim(),
      },
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
}
        `.trim(),
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
        return this._page.Locator("[name=\"q\"]");
    }

    /// <summary>
    /// Search button
    /// </summary>
    public ILocator SearchButton()
    {
        return this._page.Locator("div:not([jsname])>center>input[name=\"btnK\"]");
    }

    /// <summary>
    /// Search button on the suggestion box
    /// </summary>
    public ILocator SearchButtonOnSuggestionBox()
    {
        return this._page.Locator("div[jsname]>center>input[name=\"btnK\"]");
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
        return this._page.Locator("input[name=\"q\"][type=\"text\"]");
    }

    /// <summary>
    /// The hidden Search box
    /// </summary>
    public ILocator HiddenSearchBox()
    {
        return this._page.Locator("input[name=\"q\"][type=\"hidden\"]");
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
[TestClass]
public partial class HomeTestSuite : PageTest
{
    /// <summary>
    /// Search for 'playwright'
    /// </summary>
    [TestMethod]
    public async Task SearchForPlaywrightTestCase()
    {
        PageDefinitions defs = new PageDefinitions(this.Page);

        await Page.GotoAsync("https://www.google.com/");
        await defs.HomePage.SearchBox().FillAsync("playwright");

        // Click the search button on the suggest box
        await defs.HomePage.SearchButtonOnSuggestionBox().ClickAsync();
        Assert.IsTrue((await Page.TitleAsync()).Contains("playwright"));

        // Expecting the hidden search box to make the test effectively waits for search result page to load
        await Expect(defs.SearchResultPage.HiddenSearchBox()).ToHaveValueAsync("playwright");
        await Expect(defs.SearchResultPage.SearchBox()).ToHaveValueAsync("playwright");
    }
}
        `.trim(),
      },
    ],
  };

```
