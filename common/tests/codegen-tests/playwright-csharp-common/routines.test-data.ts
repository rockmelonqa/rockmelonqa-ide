import { AutomationFramework, Indent, IRmProj, ITestCase, ITestSuite, Language, LocatorType, TestFramework } from "../../../src/file-defs";
import { RmpSpec } from "../../test-helpers/rm-project-spec.types";

export const createTestDataPlaywrightCsharpRoutines = (): RmpSpec => {
  return {
    projectName: "playwright-csharp-routines",
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
      testIdAttributeName: "",
    },
    configFiles: [],
    pages: [
      {
        id: "",
        name: "HomePage",
        description: "Fills page",
        elements: [
          {
            id: "",
            type: "pageElement",
            name: "name",
            findBy: LocatorType.Css,
            locator: "[name='name']",
            description: "Name",
          },
          {
            id: "",
            type: "pageElement",
            name: "street",
            findBy: LocatorType.Css,
            locator: "[name='street']",
            description: "Street",
          },
          {
            id: "",
            type: "pageElement",
            name: "district",
            findBy: LocatorType.Css,
            locator: "[name='district']",
            description: "District",
          },
          {
            id: "",
            type: "pageElement",
            name: "bio",
            findBy: LocatorType.Css,
            locator: "[name='bio']",
            description: "Bio",
          },
        ],
      },
    ],
    testcases: [
      {
        id: "",
        name: "fills",
        description: "Fills the values on Home page",
        steps: [
          {
            id: "",
            type: "testStep",
            page: "",
            element: "",
            action: "GoToUrl",
            // Chechkout repo https://dev.azure.com/zapcentral/zap-forks/_git/playwright-test-pages and run the local website
            data: "http://localhost:3000/routines/fills.html",
          },
          {
            id: "",
            type: "testStep",
            action: "RunTestRoutine",
            data: "FillName",
            parameters: ["*"],
          },
          {
            id: "",
            type: "testStep",
            action: "RunTestRoutine",
            data: "FillDistrictAndBio",
            parameters: ["DS One", "DS Two"],
          },
        ],
      },
    ],
    testroutines: [
      {
        id: "",
        name: "FillName",
        description: "Fill the name",
        steps: [
          {
            id: "",
            type: "testStep",
            page: "HomePage",
            element: "name",
            action: "Input",
            data: {
              "DataSet Number One": "John",
              "DataSet Number Two": "Jane",
              "DataSet Number Three": "Jim",
            },
          },
        ],
        dataSets: [
          {
            id: "",
            name: "DataSet Number One",
            description: "One One One",
          },
          {
            id: "",
            name: "DataSet Number Two",
            description: "Two Two Two",
          },
          {
            id: "",
            name: "DataSet Number Three",
            description: "Three Three Three",
          },
        ],
      },
      {
        id: "",
        name: "FillDistrictAndBio",
        description: "Fill the district and bio",
        steps: [
          {
            id: "",
            type: "testStep",
            page: "HomePage",
            element: "district",
            action: "Input",
            data: {
              "DS One": "Seven",
              "DS Two": "Eight",
            },
          },
          {
            id: "",
            type: "testStep",
            page: "HomePage",
            element: "bio",
            action: "Input",
            data: {
              "DS One": "Love Reading",
              "DS Two": "Playing Video games",
            },
          },
        ],
        dataSets: [
          {
            id: "",
            name: "DS One",
            description: "One One One",
          },
          {
            id: "",
            name: "DS Two",
            description: "Two Two Two",
          },
        ],
      },
    ],
    testsuites: [
      {
        id: "",
        name: "Fills",
        description: "Test for Fills",
        testcases: ["fills"],
      },
    ],
    outputFiles: [],
  };
};
