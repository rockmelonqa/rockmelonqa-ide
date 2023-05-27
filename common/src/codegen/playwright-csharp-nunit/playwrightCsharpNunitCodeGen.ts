import { EOL } from "os";
import path from "path";
import {
  ActionType,
  IRmProjFile,
  ISourceProjectMetadata,
  ITestCase,
  ITestRoutine,
  ITestSuite,
  LocatorType,
  StandardFolder,
} from "../../file-defs";
import { IPage } from "../../file-defs/pageFile";
import { StandardOutputFile } from "../../file-defs/standardOutputFile";
import { createOutputProjectMetadata } from "../codegen";
import { ICodeGen } from "../types";
import { languageExtensionMap } from "../utils/languageExtensionMap";
import { addIndent, hasPlaceholder, indentCharMap, upperCaseFirstChar } from "../utils/stringUtils";
import { NunitProjectMeta } from "./nunitProjectMeta";
import { PlaywrightCsharpNunitTemplatesProvider } from "./playwrightCsharpNunitTemplatesProvider";
import { IDataSetInfo } from "../playwright-charp-common/dataSetInfo";
import { createCleanName } from "../utils/createName";

export class PlaywrightCsharpNunitCodeGen implements ICodeGen {
  private _projMeta: ISourceProjectMetadata;
  private _rmprojFile: IRmProjFile;
  private _rootNamespace: string;
  private _templateProvider: PlaywrightCsharpNunitTemplatesProvider;
  private _outputFileExt: string;

  private _indentChar: string;
  private _indentSize: number;
  private _indentString: string;

  private _outProjMeta: NunitProjectMeta;

  constructor(projMeta: ISourceProjectMetadata) {
    const rmprojFile = projMeta.project;

    this._projMeta = projMeta;
    this._rmprojFile = rmprojFile;
    this._rootNamespace = rmprojFile.content.rootNamespace;
    this._templateProvider = new PlaywrightCsharpNunitTemplatesProvider(
      path.join(rmprojFile.folderPath, StandardFolder.CustomCode, "templates")
    );
    this._outputFileExt = languageExtensionMap[rmprojFile.content.language];

    /** Space char of tab char */
    this._indentChar = indentCharMap.get(rmprojFile.content.indent)!;
    /** Size of 1 index: eg. 2 spaces or 4 spaces */
    this._indentSize = rmprojFile.content.indentSize;
    /** String representing 1 indent */
    this._indentString = this._indentChar.repeat(this._indentSize);

    this._outProjMeta = new NunitProjectMeta(projMeta);
  }

  async generateCode(full: boolean, writeFile: (path: string, content: string) => Promise<void>): Promise<string> {
    // # Build PageDefinitions

    // Each page definition will be a property
    // Filename: PageDefinitions.cs
    await writeFile(
      `${StandardOutputFile.PageDefinitions}${this._outputFileExt}`,
      this.generatePageDefinitions(this._projMeta.pages.map((p) => p.content))
    );

    // # Generate Page definition for each page
    // Filename: Pages/{PageName}.cs
    for (let page of this._projMeta.pages) {
      let filePath = this._outProjMeta.get(page.content.id)!.outputFileRelPath;
      await writeFile(filePath, this.generatePage(page.content));
    }

    // # Generate TestCase

    // Filename: TestCases/{TestCaseName}.cs
    for (let { content: testCase } of this._projMeta.testCases) {
      let testClassContent = this.generateTestCaseFile(
        testCase,
        this._projMeta.pages.map((p) => p.content)
      );
      let outputFileRelPath = this._outProjMeta.get(testCase.id)!.outputFileRelPath;

      await writeFile(outputFileRelPath, testClassContent);
    }

    // Filename: TestRoutines/{TestRoutineName}.cs
    for (let { content: routine } of this._projMeta.testRoutines) {
      let testRoutineContent = this.generateTestRoutineFile(
        routine,
        this._projMeta.pages.map((p) => p.content)
      );
      let outputFileRelPath = this._outProjMeta.get(routine.id)!.outputFileRelPath;

      await writeFile(outputFileRelPath, testRoutineContent);
    }

    // Filename: Tests/{TestClassName}.cs
    for (let testSuite of this._projMeta.testSuites) {
      let fileRelPath = this._outProjMeta.get(testSuite.content.id)!.outputFileRelPath;
      let classContent = this.generateTestSuiteFile(
        testSuite.content,
        this._projMeta.testCases.map((tcFile) => tcFile.content)
      );
      await writeFile(fileRelPath, classContent);
    }

    // # Generate TestLocatorHelper

    // Filename: Support/LocatorHelper.cs
    await writeFile(
      `Support/${StandardOutputFile.LocatorHelper}${this._outputFileExt}`,
      this._templateProvider.getLocatorHelper(this._rmprojFile.content.rootNamespace)
    );
    // Filename: Support/TestCaseBase.cs
    await writeFile(
      `Support/${StandardOutputFile.TestCaseBase}${this._outputFileExt}`,
      this._templateProvider.getTestCaseBase(this._rmprojFile.content.rootNamespace)
    );

    // Filename: Support/TestSuiteBase.cs
    await writeFile(
      `Support/${StandardOutputFile.TestSuiteBase}${this._outputFileExt}`,
      this._templateProvider.getTestSuiteBase(this._rmprojFile.content.rootNamespace, this._rmprojFile.content.testIdAttributeName)
    );
    // # Generate full project files
    // Files:
    //     - {Namespace}.csproj
    //     - Usings.cs
    //     - .runsettings
    if (full) {
      await writeFile(
        `${this._rmprojFile.content.rootNamespace}.csproj`,
        this._templateProvider.getCSProject(this._rmprojFile.content.rootNamespace)
      );
      await writeFile(
        `${StandardOutputFile.Usings}${this._outputFileExt}`,
        this._templateProvider.getUsings(this._rmprojFile.content.rootNamespace)
      );
      await writeFile(`${StandardOutputFile.RunSettings}`, this._templateProvider.getRunSettings());
    }

    // Write output project metadata
    const outputProjectMetadata = await createOutputProjectMetadata(this._rmprojFile);
    await writeFile(StandardOutputFile.MetaData, JSON.stringify(outputProjectMetadata, null, 2));

    return "";
  }

  generatePageDefinitions(pages: IPage[]): string {
    let usingDirectives: string[] = [];
    for (let page of pages) {
      let pageNamespace = this._outProjMeta.get(page.id)!.outputFileFullNamespace;
      let usingDirective = `using ${pageNamespace};`;
      if (!usingDirectives.includes(usingDirective)) {
        usingDirectives.push(usingDirective);
      }
    }

    let usings = usingDirectives.join(EOL);

    let pagesDeclarationItems = [];
    for (let page of pages) {
      let pageName = upperCaseFirstChar(this._outProjMeta.get(page.id)!.outputFileClassName);
      pagesDeclarationItems.push(`public ${pageName} ${pageName} { get; private set; }`);
    }
    let pagesDeclarations = pagesDeclarationItems.join(EOL);
    pagesDeclarations = addIndent(pagesDeclarations, this._indentString);
    //
    // Build constructor body
    // Example:
    // this.LoginPage = new LoginPage(this);
    //
    let pageInitItems = [];
    for (let page of pages) {
      let pageName = upperCaseFirstChar(this._outProjMeta.get(page.id)!.outputFileClassName);
      pageInitItems.push(`${pageName} = new ${pageName}(page);`);
    }

    let pageInits = pageInitItems.join(EOL);
    pageInits = addIndent(pageInits, this._indentString.repeat(2));

    return this._templateProvider.getPageDefinitions(usings, this._rootNamespace, pagesDeclarations, pageInits);
  }

  generatePage(page: IPage): string {
    let pageItems = [];

    for (let element of page.elements) {
      if (element.type === "pageElement") {
        pageItems.push(
          this._templateProvider.getLocator({
            elementName: upperCaseFirstChar(element.name!),
            locatorStr: element.locator!,
            locatorType: element.findBy!,
            description: element.description!,
            hasParams: hasPlaceholder(element.locator!),
            returnedLocatorType:
              element.findBy! === LocatorType.IFrame ||
              element.findBy! === LocatorType.IFrameId ||
              element.findBy! === LocatorType.IFrameName
                ? "IFrameLocator"
                : "ILocator",
          })
        );
        continue;
      }
      if (element.type === "comment") {
        pageItems.push(""); // Add an empty line before comment
        pageItems.push(this._templateProvider.getComment(element.comment!));
      }
    }

    let pageBody = pageItems.join(EOL + EOL);
    pageBody = addIndent(pageBody, this._indentString);

    return this._templateProvider.getPage(
      this._outProjMeta.get(page.id)!.outputFileFullNamespace,
      this._outProjMeta.get(page.id)!.outputFileClassName,
      page.description || "",
      pageBody
    );
  }

  generateTestSuiteFile(testSuite: ITestSuite, testcases: ITestCase[]) {
    const testcaseMethods: string[] = [];
    const usingDirectives: string[] = [];

    for (let testcaseId of testSuite.testcases) {
      let testcase = testcases.find((tc) => tc.id === testcaseId);
      if (!testcase) {
        throw new Error("DEV ERROR: cannot find testcase with id: " + testcaseId);
      }

      let fullNamespace = this._outProjMeta.get(testcase.id)!.outputFileFullNamespace;

      let usingDirective = `using ${fullNamespace};`;
      if (!usingDirectives.includes(usingDirective)) {
        usingDirectives.push(usingDirective);
      }

      let testcaseFunction = this.generateTestCaseFunction(testcase);
      testcaseMethods.push(testcaseFunction);
    }
    let usings = usingDirectives.join(EOL);
    let classBody = testcaseMethods.join(EOL + EOL);

    // Indent test method body with 1 indent;
    classBody = addIndent(classBody, this._indentString);

    let testClass = this._templateProvider.getTestSuiteFile(
      usings,
      this._outProjMeta.get(testSuite.id)!.outputFileClassName,
      testSuite.description,
      classBody,
      this._rootNamespace,
      this._outProjMeta.get(testSuite.id)!.outputFileFullNamespace
    );
    return testClass;
  }

  generateTestCaseFile(testCase: ITestCase, pages: IPage[]) {
    const testcaseBody = this.generateTestCaseBody(testCase, pages);

    let testFile = this._templateProvider.getTestCaseFile(
      this._outProjMeta.get(testCase.id)!.outputFileClassName,
      testCase.description,
      testcaseBody,
      this._rootNamespace,
      this._outProjMeta.get(testCase.id)!.outputFileFullNamespace
    );
    return testFile;
  }

  generateTestCaseFunction(testCase: ITestCase) {
    const testcaseName = this._outProjMeta.get(testCase.id)!.outputFileClassName;
    const testCaseMethod = this._templateProvider.getTestFunction(testcaseName, testCase.description);
    return testCaseMethod;
  }

  generateTestRoutineFile(testRoutine: ITestRoutine, pages: IPage[]) {
    const testRoutineBody = this.generateTestRoutineBody(testRoutine, pages);

    const datasets: IDataSetInfo[] = testRoutine.dataSets.map((dataset) => {
      const dsName = createCleanName(dataset.name);

      const dsInfo: IDataSetInfo = {
        name: dsName,
        description: dataset.description,

        // Obtain dataset values from data of each step
        values: testRoutine.steps.map((step) => {
          return step.data[dataset.id];
        }),
      };

      return dsInfo;
    });

    let routineFileContent = this._templateProvider.getTestRoutineFile(
      this._outProjMeta.get(testRoutine.id)!.outputFileClassName,
      testRoutine.description,
      testRoutineBody,
      this._rootNamespace,
      this._outProjMeta.get(testRoutine.id)!.outputFileFullNamespace,
      datasets
    );
    return routineFileContent;
  }

  generateTestCaseBody(testCase: ITestCase, pages: IPage[]) {
    let stepItems = [];
    for (let step of testCase.steps) {
      if (step.type === "testStep") {
        let pageName = "";
        let elementName = "";

        if (step.page) {
          let pageId = step.page;
          let page = pages.find((p) => p.id === pageId);
          if (!page) {
            throw new Error("DEV ERROR: " + `Cannot find page with ID ${pageId}`);
          }
          pageName = this._outProjMeta.get(page.id)!.outputFileClassName;

          if (step.element) {
            let elementId = step.element;
            let element = page.elements.find((e) => e.id === elementId);
            if (!element) {
              throw new Error("DEV ERROR: " + `Cannot find element with ID ${elementId} on page ${pageName}`);
            }
            elementName = element.name || "";
          }
        }

        stepItems.push(
          this._templateProvider.getTestCaseAction({
            pageName: pageName,
            elementName: upperCaseFirstChar(elementName),
            action: step.action! as unknown as ActionType,
            data: step.data?.toString() || "",
            parameters: step.parameters || [],
          })
        );
        continue;
      }

      if (step.type === "comment") {
        // Add an empty line before the comment
        stepItems.push("");
        stepItems.push(this._templateProvider.getComment(step.comment!));
      }
    }

    let testcaseBody = stepItems.join(EOL);

    // Indent test method body with 1 indent;
    testcaseBody = addIndent(testcaseBody, this._indentString.repeat(2));
    return testcaseBody;
  }

  generateTestRoutineBody(testCase: ITestRoutine, pages: IPage[]) {
    let stepItems = [];
    for (let step of testCase.steps) {
      let index = testCase.steps.indexOf(step);

      if (step.type === "testStep") {
        let pageName = "";
        let elementName = "";

        if (step.page) {
          let pageId = step.page;
          let page = pages.find((p) => p.id === pageId);
          if (!page) {
            throw new Error("DEV ERROR: " + `Cannot find page with ID ${step.page}`);
          }
          pageName = this._outProjMeta.get(page.id)!.outputFileClassName;

          if (step.element) {
            let elementId = step.element;
            let element = page.elements.find((e) => e.id === elementId);
            if (!element) {
              throw new Error("DEV ERROR: " + `Cannot find element with ID ${elementId} on page ${pageName}`);
            }
            elementName = element.name || "";
          }
        }

        stepItems.push(
          this._templateProvider.getRoutineAction({
            pageName: pageName,
            elementName: upperCaseFirstChar(elementName),
            action: step.action! as unknown as ActionType,
            data: `ds[${index}]`,
            parameters: step.parameters || [],
          })
        );
        continue;
      }

      if (step.type === "comment") {
        // Add an empty line before the comment
        stepItems.push("");
        stepItems.push(this._templateProvider.getComment(step.comment!));
      }
    }

    let testcaseBody = stepItems.join(EOL);

    // If there is no step, we add an `await` so that there is no build warning about `async` method
    if (testcaseBody.length === 0) {
      testcaseBody = `await Task.CompletedTask;`;
    }

    // Indent test method body with 1 indent;
    testcaseBody = addIndent(testcaseBody, this._indentString.repeat(2));
    return testcaseBody;
  }
}
