import { AutomationFramework, Indent, IRmProj, ITestCase, ITestSuite, Language, LocatorType, TestFramework } from "../../../src/file-defs";
import { RmpSpec } from "../../test-helpers/rm-project-spec.types";

export const createTestData = (): RmpSpec => {
  return {
    projectName: "rm-playwright-mstest",
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
        name: "google/home",
        description: "Home page",
        elements: [
          {
            id: "",
            type: "pageElement",
            name: "button",
            findBy: LocatorType.Css,
            locator: "button",
            description: "Button",
          },
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
        name: "click",
        description: "Do click",
        steps: [
          {
            id: "",
            type: "testStep",
            page: "",
            element: "",
            action: "GoToUrl",
            data: "http://localhost:3000/actions/click.html",
          },
          {
            id: "",
            type: "testStep",
            page: "google/home",
            element: "button",
            action: "Click",
            data: "",
          },
        ],
      },
      {
        id: "",
        name: "actions/simple/clear",
        description: "Do clear",
        steps: [
          {
            id: "",
            type: "testStep",
            page: "",
            element: "",
            action: "GoToUrl",
            data: "http://localhost:3000/actions/click.html",
          },
          {
            id: "",
            type: "testStep",
            page: "google/home",
            element: "input",
            action: "VerifyHasValue",
            data: "Hello",
          },
        ],
      },
    ],
    testsuites: [
      {
        id: "",
        name: "home",
        description: "HomePage test suite",
        testcases: ["click"],
      },
      {
        id: "",
        name: "another/anotherHome",
        description: "Another HomePage test suite",
        testcases: ["actions/simple/clear"],
      },
    ],
  };
};
