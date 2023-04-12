export const commonMsTestOutputFiles = [
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
    <RunSettingsFilePath>$(MSBuildProjectDirectory)\\.runsettings</RunSettingsFilePath>
    <VSTestLogger>trx</VSTestLogger>
    <VSTestResultsDirectory>$(MSBuildProjectDirectory)\\TestResults</VSTestResultsDirectory>
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
    fileRelPath: "Support/RmTestSuiteBase.cs",
    fileContent: `
namespace AutomationTests.Support;

[TestClass]
public abstract class RmTestSuiteBase : PageTest
{
    protected PageTest? TestSuiteInstance;

    /// <summary>
    /// Returns TestSuiteInstance.Page when TestSuiteInstance is not null, otherwise return the Page of base class (PageTest.Page)
    /// </summary>
    public new IPage Page => TestSuiteInstance == null ? base.Page : TestSuiteInstance.Page;

    /// <summary>
    /// Default constructor
    /// </summary>
    public RmTestSuiteBase()
    {
    }

    /// <summary>
    /// Create new instance of RmTestSuiteBase with the provided testSuiteInstance
    /// </summary>
    public RmTestSuiteBase(PageTest testSuiteInstance)
    {
        this.TestSuiteInstance = testSuiteInstance;
    }
}

    `.trim(),
  },
];

export const commonNunitOutputFiles = [
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
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.3.2" />
    <PackageReference Include="Microsoft.Playwright.NUnit" Version="1.27.2" />
    <PackageReference Include="nunit" Version="3.13.3" />
    <PackageReference Include="NUnit3TestAdapter" Version="4.3.0" />
    <PackageReference Include="NUnit.Analyzers" Version="3.5.0" />
    <PackageReference Include="coverlet.collector" Version="3.1.2" />
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
global using NUnit.Framework;
global using Microsoft.Playwright;
global using Microsoft.Playwright.NUnit;
global using AutomationTests.Support;
    `.trim(),
  },
  {
    fileRelPath: "Support/RmSingleCaseSuiteBase.cs",
    fileContent: `
namespace AutomationTests.Support;

public abstract class RmSingleCaseSuiteBase : PageTest
{
    protected PageTest? TestSuiteInstance;

    /// <summary>
    /// Returns TestSuiteInstance.Page when TestSuiteInstance is not null, otherwise return the Page of base class (PageTest.Page)
    /// </summary>
    public new IPage Page => TestSuiteInstance == null ? base.Page : TestSuiteInstance.Page;

    /// <summary>
    /// Default constructor
    /// </summary>
    public RmSingleCaseSuiteBase()
    {
    }

    /// <summary>
    /// Create new instance of RmTestSuiteBase with the provided testSuiteInstance
    /// </summary>
    public RmSingleCaseSuiteBase(PageTest testSuiteInstance)
    {
        this.TestSuiteInstance = testSuiteInstance;
    }
}
    `.trim(),
  },
];
