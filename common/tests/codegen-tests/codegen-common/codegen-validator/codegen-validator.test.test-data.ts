import {
  AutomationFramework,
  Indent,
  IRmProj,
  ITestCase,
  ITestSuite,
  Language,
  LocatorType,
  TestFramework,
} from "../../../../src/file-defs";
import { RmpSpec } from "../../../test-helpers/rm-project-spec.types";
import { commonMsTestOutputFiles } from "../../../test-helpers/common-files-dotnet";
import { simpleRoutineTestData } from "../../playwright-csharp/simple-routine.test-data";

export const createCodegenValidatorTestData = (): RmpSpec => {
  return {
    // Name of the project file, should be unique among tests in `codegen` test
    projectName: "codegen-validator-test",
    // The content of the rmproj file
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
        name: "FillsScreen",
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
        description: "Fills the values on Fills page",
        steps: [
          {
            id: "",
            type: "routine",
            routine: "FillName",
            dataset: "DataSet Number Two",
          },
          // Totally valid
          {
            id: "",
            type: "testStep",
            page: "FillsScreen",
            element: "street",
            action: "Click",
            data: "Nguyen Van Linh",
          },
          // Missing action
          {
            id: "",
            type: "testStep",
            page: "FillsScreen",
            element: "street",
            action: "",
            data: "Nguyen Van Linh",
          },
          // Clear: valid
          {
            id: "",
            type: "testStep",
            page: "FillsScreen",
            element: "name",
            action: "Clear",
            data: "",
          },
          // Clear:  missing "Page" and "Element"
          {
            id: "",
            type: "testStep",
            page: "",
            element: "",
            action: "Clear",
            data: "",
          },
          // Clear:  "Element"
          {
            id: "",
            type: "testStep",
            page: "FillsScreen",
            element: "",
            action: "Clear",
            data: "",
          },
          // Click: valid
          {
            id: "",
            type: "testStep",
            page: "FillsScreen",
            element: "name",
            action: "Click",
            data: "Seven",
          },
          // Click:  missing "Page" and "Element"
          {
            id: "",
            type: "testStep",
            page: "",
            element: "",
            action: "Click",
            data: "",
          },
          // Click:  "Element"
          {
            id: "",
            type: "testStep",
            page: "FillsScreen",
            element: "",
            action: "Click",
            data: "",
          },
          // Click Popup:  missing "Page" and "Element"
          {
            id: "",
            type: "testStep",
            page: "",
            element: "",
            action: "ClickPopup",
            data: "Seven",
          },
          // Click Popup:  missing "Element"
          {
            id: "",
            type: "testStep",
            page: "FillsScreen",
            element: "",
            action: "ClickPopup",
            data: "Seven",
          },
          // Delay: Valid
          {
            id: "",
            type: "testStep",
            page: "",
            element: "",
            action: "Delay",
            data: "2000",
          },
          // Delay: Missing data
          {
            id: "",
            type: "testStep",
            page: "",
            element: "",
            action: "Delay",
            data: "",
          },
          // GotoUrl: Valid
          {
            id: "",
            type: "testStep",
            page: "",
            element: "",
            action: "GoToUrl",
            data: "",
          },
          // GotoUrl: Missing data
          {
            id: "",
            type: "testStep",
            page: "",
            element: "",
            action: "GoToUrl",
            data: "",
          },
          // Input: Valid
          {
            id: "",
            type: "testStep",
            page: "FillsScreen",
            element: "name",
            action: "Input",
            data: "TEST",
          },
          // Input:  missing "Page" and "Element"
          {
            id: "",
            type: "testStep",
            page: "",
            element: "",
            action: "Input",
            data: "",
          },
          // Input:  missing "Element"
          {
            id: "",
            type: "testStep",
            page: "FillsScreen",
            element: "",
            action: "Input",
            data: "",
          },
          // InputByCode:  Valid
          {
            id: "",
            type: "testStep",
            page: "FillsScreen",
            element: "name",
            action: "InputByCode",
            data: "test",
          },
          // InputByCode:  missing "Page" and "Element"
          {
            id: "",
            type: "testStep",
            page: "",
            element: "",
            action: "InputByCode",
            data: "",
          },
          // InputByCode:  "Element"
          {
            id: "",
            type: "testStep",
            page: "FillsScreen",
            element: "",
            action: "InputByCode",
            data: "",
          },
          // InputByCode:  missing "Data"
          {
            id: "",
            type: "testStep",
            page: "FillsScreen",
            element: "name",
            action: "InputByCode",
            data: "",
          },
          // RunCode:  missing "Data"
          {
            id: "",
            type: "testStep",
            page: "",
            element: "",
            action: "RunCode",
            data: "",
          },
          // SelectOption:  Valid
          {
            id: "",
            type: "testStep",
            page: "FillsScreen",
            element: "name",
            action: "SelectOption",
            data: "test",
          },
          // SelectOption:  missing "Page" and "Element"
          {
            id: "",
            type: "testStep",
            page: "",
            element: "",
            action: "SelectOption",
            data: "",
          },
          // SelectOption:  "Element"
          {
            id: "",
            type: "testStep",
            page: "FillsScreen",
            element: "",
            action: "SelectOption",
            data: "",
          },
          // SelectOption:  missing "Data"
          {
            id: "",
            type: "testStep",
            page: "FillsScreen",
            element: "name",
            action: "SelectOption",
            data: "",
          },
        ],
      },
    ],
    testsuites: [],
    testroutines: [],
    outputFiles: [],
  };
};
