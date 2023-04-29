import { EOL } from "os";
import path from "path";
import { ActionType, IRmProjFile, ISourceProjectMeta, ITestCase, ITestSuite, LocatorType, StandardFolder } from "../../file-defs";
import { IPage } from "../../file-defs/pageFile";
import { StandardOutputFile } from "../../file-defs/standardOutputFile";
import { createCodeGenMeta } from "../codegen";
import { CodeGenMetaFactory } from "../codegenMetaFactory";
import { ICodeGen } from "../types";
import { languageExtensionMap } from "../utils/languageExtensionMap";
import { addIndent, hasPlaceholder, indentCharMap, upperCaseFirstChar } from "../utils/stringUtils";
import { MsTestProjMeta } from "./msTestProjMeta";
import { PlaywrightCsharpMsTestTemplatesProvider } from "./playwrightCsharpMsTestTemplatesProvider";

export class PlaywrightCsharpMSTestCodeGen implements ICodeGen {
  private _projMeta: ISourceProjectMeta;
  private _rmprojFile: IRmProjFile;
  private _rootNamespace: string;
  private _templateProvider: PlaywrightCsharpMsTestTemplatesProvider;
  private _outputFileExt: string;

  private _indentChar: string;
  private _indentSize: number;
  private _indentString: string;

  private _outProjMeta: MsTestProjMeta;

  /**
   * Constructor
   */
  constructor(projMeta: ISourceProjectMeta) {
    const rmprojFile = projMeta.project;

    this._projMeta = projMeta;
    this._rmprojFile = rmprojFile;
    this._rootNamespace = rmprojFile.content.rootNamespace;
    this._templateProvider = new PlaywrightCsharpMsTestTemplatesProvider(
      path.join(rmprojFile.folderPath, StandardFolder.CustomCode, "templates")
    );
    this._outputFileExt = languageExtensionMap[rmprojFile.content.language];

    /** Space char of tab char */
    this._indentChar = indentCharMap.get(rmprojFile.content.indent)!;
    /** Size of 1 index: eg. 2 spaces or 4 spaces */
    this._indentSize = rmprojFile.content.indentSize;
    /** String representing 1 indent */
    this._indentString = this._indentChar.repeat(this._indentSize);

    this._outProjMeta = new MsTestProjMeta(projMeta);
  }

  /** Generate MsTest project */
  async generateCode(full: boolean, writeFile: (path: string, content: string) => Promise<void>): Promise<string> {
    // # Build PageDefinitions

    // # Generate Page definition for each page
    // Filename: Pages/{PageName}.cs
    for (let page of this._projMeta.pages) {
      let pageContent = this.generatePage(page.content);
      let fileRelPath = this._outProjMeta.get(page.content.id)!.outputFileRelPath;
      await writeFile(fileRelPath, pageContent);
    }

    // Each page definition will be a property
    // Filename: PageDefinitions.cs
    await writeFile(
      `${StandardOutputFile.PageDefinitions}${this._outputFileExt}`,
      this.generatePageDefinitions(this._projMeta.pages.map((p) => p.content))
    );

    // # Generate TestCases

    // Filename: TestCases/{TestCaseName}.cs
    for (let { content: testCase } of this._projMeta.testCases) {
      let testClassContent = this.generateTestCaseFile(
        testCase,
        this._projMeta.pages.map((p) => p.content)
      );
      let outputFileRelPath = this._outProjMeta.get(testCase.id)!.outputFileRelPath;

      await writeFile(outputFileRelPath, testClassContent);
    }

    // # Generate TestSuites

    // Filename: TestSuites/{TestSuiteName}.cs

    for (let { content: testsuite } of this._projMeta.testSuites) {
      let outputFileRelPath = this._outProjMeta.get(testsuite.id)!.outputFileRelPath;
      let testClassContent = this.generateTestSuiteFile(
        testsuite,
        this._projMeta.testCases.map((tc) => tc.content)
      );
      await writeFile(outputFileRelPath, testClassContent);
    }

    // # Generate TestLocatorHelper

    // Filename: LocatorHelper.cs
    await writeFile(
      `Support/${StandardOutputFile.LocatorHelper}${this._outputFileExt}`,
      this._templateProvider.GetLocatorHelper(this._rmprojFile.content.rootNamespace)
    );

    await writeFile(
      `Support/${StandardOutputFile.TestCaseBase}${this._outputFileExt}`,
      this._templateProvider.getTestCaseBase(this._rmprojFile.content.rootNamespace)
    );

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
        this._templateProvider.getCsProject(this._rmprojFile.content.rootNamespace)
      );
      await writeFile(`${StandardOutputFile.Usings}${this._outputFileExt}`, this._templateProvider.getUsings());
      await writeFile(`${StandardOutputFile.RunSettings}`, this._templateProvider.getRunSettings());
    }

    // Write suites meta
    const inProjMeta = await createCodeGenMeta(this._rmprojFile);
    const outProjMeta = CodeGenMetaFactory.newInstance(inProjMeta);
    const data = outProjMeta.generateOutputProjectMeta();
    await writeFile(StandardOutputFile.MetaData, JSON.stringify(data, null, 2));

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

    let propertyDeclarationItems = [];
    for (let page of pages) {
      let pageName = this._outProjMeta.get(page.id)!.outputFileClassName;
      propertyDeclarationItems.push(`public ${pageName} ${pageName} { get; private set; }`);
    }

    let propertyDeclarations = propertyDeclarationItems.join(EOL);
    propertyDeclarations = addIndent(propertyDeclarations, this._indentString);

    //
    // Build constructor body
    // Example:
    // this.LoginPage = new LoginPage(this);
    //
    let propertyInitList = [];
    for (let page of pages) {
      let pageName = this._outProjMeta.get(page.id)!.outputFileClassName;
      propertyInitList.push(`${pageName} = new ${pageName}(page);`);
    }

    let propertyInits = propertyInitList.join(EOL);
    propertyInits = addIndent(propertyInits, this._indentString.repeat(2));

    return this._templateProvider.getPageDefinitions(this._rootNamespace, usings, propertyDeclarations, propertyInits);
  }

  generatePage(page: IPage): string {
    let pageItems = [];
    for (let element of page.elements) {
      if (element.type === "pageElement") {
        pageItems.push(
          this._templateProvider.getLocator({
            elementName: element.name!,
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
        pageItems.push(this._templateProvider.getComment(element.comment!));
      }
    }

    let pageBody = pageItems.join(EOL + EOL);

    // Indent the output with 1 indent
    pageBody = addIndent(pageBody, this._indentString);

    let fullNamespace = this._outProjMeta.get(page.id)!.outputFileFullNamespace;
    let pageClassName = this._outProjMeta.get(page.id)!.outputFileClassName;

    return this._templateProvider.GetPage(fullNamespace, pageClassName, page.description || "", pageBody);
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
    const testCaseMethod = this._templateProvider.getTestFunction(upperCaseFirstChar(testcaseName), testCase.description);
    return testCaseMethod;
  }

  generateTestCaseBody(testCase: ITestCase, pages: IPage[]) {
    let stepItems = [];
    for (let step of testCase.steps) {
      if (step.type === "testStep") {
        let pageName = "";
        let elementName = "";

        if (step.page) {
          let page = pages.find((p) => p.id === step.page);
          if (!page) {
            throw new Error("DEV ERROR: " + `Cannot find page with ID ${step.page}`);
          }
          pageName = this._outProjMeta.get(page.id)!.outputFileClassName;

          if (step.element) {
            let element = page.elements.find((e) => e.id === step.element);
            if (!element) {
              throw new Error("DEV ERROR: " + `Cannot find element with ID ${step.element} on page ${pageName}`);
            }
            elementName = element.name || "";
          }
        }

        stepItems.push(
          this._templateProvider.getAction({
            pageName: pageName,
            elementName: upperCaseFirstChar(elementName),
            action: step.action! as unknown as ActionType,
            data: step.data || "",
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
