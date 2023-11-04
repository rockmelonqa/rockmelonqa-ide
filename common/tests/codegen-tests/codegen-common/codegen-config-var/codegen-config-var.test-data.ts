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
import { simpleRoutineTestData } from "../../playwright-csharp-common/simple-routine.test-data";

export const createCodegenWithConfigVarTestData = (): RmpSpec => {
  return {
    // Name of the project file, should be unique among tests in `codegen` test
    projectName: "codegen-config-var-test",
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
    configFiles: [
      {
        name: "default",
        settings: [
          {
            name: "TestUser",
            value: "jim",
          },
          {
            name: "TestPassword",
            value: "xxx",
          },
          {
            name: "RememeberMe",
            value: "yes",
          },
          {
            name: "DelayMs",
            value: "2000",
          },
          {
            name: "TheUrl",
            value: "https://github.com/",
          },
          {
            name: "Attr",
            value: "name=Test",
          },
        ],
      },
      {
        name: "local",
        settings: [
          {
            name: "TestUser",
            value: "john",
          },
          {
            name: "TestPassword",
            value: "yyy",
          },
        ],
      },
    ],

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
            type: "testStep",
            page: "",
            element: "",
            action: "GoToUrl",
            data: "{TheUrl}",
          },
          {
            id: "",
            type: "testStep",
            page: "",
            element: "",
            action: "Delay",
            data: "{DelayMs}",
          },
          {
            id: "",
            type: "testStep",
            page: "FillsScreen",
            element: "name",
            action: "Input",
            data: "{TestUser}",
          },
          {
            id: "",
            type: "testStep",
            page: "FillsScreen",
            element: "name",
            action: "SelectOption",
            data: "{TestUser}",
          },
          {
            id: "",
            type: "testStep",
            page: "FillsScreen",
            element: "name",
            action: "VerifyAttribute",
            data: "{Attr}",
          },
          {
            id: "",
            type: "testStep",
            page: "FillsScreen",
            element: "name",
            action: "VerifyHasText",
            data: "{TestUser}",
          },
          {
            id: "",
            type: "testStep",
            page: "FillsScreen",
            element: "name",
            action: "VerifyHasValue",
            data: "{TestUser}",
          },
          {
            id: "",
            type: "testStep",
            page: "FillsScreen",
            element: "name",
            action: "VerifyTitle",
            data: "{TestUser}",
          },
          {
            id: "",
            type: "testStep",
            page: "FillsScreen",
            element: "name",
            action: "VerifyTitleContains",
            data: "{TestUser}",
          },
          {
            id: "",
            type: "testStep",
            page: "FillsScreen",
            element: "name",
            action: "VerifyUrl",
            data: "{TheUrl}",
          },
        ],
      },
    ],
    testsuites: [],
    testroutines: [],
    outputFiles: [],
  };
};
