import type { IUiContext } from "$lib/context/UiContext";
import type { NodeInfo } from "$lib/dialogs/RunTestDialog/NodeInfo";
import { TestFilterBuilderBase, type ITestFilterBuilder } from "./testFilterBuilder";

/** Filter builder for `npx playwright test` command */
export class PlaywrightTypeScriptTestFilterBuilder extends TestFilterBuilderBase implements ITestFilterBuilder {
    constructor(uiContext: IUiContext) {
        super(uiContext);
    }

    build(selectedTestCases: NodeInfo[]) {
        const individualTestCaseFilters: string[] = [];
        for (const testCaseNode of selectedTestCases) {
            if (!testCaseNode.caseInfo) {
                continue;
            }
            if (!testCaseNode.parent) {
                continue;
            }
            if (!testCaseNode.parent.suiteInfo) {
                continue;
            }

            const caseInfo = testCaseNode.caseInfo;
            const suiteInfo = testCaseNode.parent.suiteInfo;

            const testSuiteRelPath = suiteInfo.outputFileRelPath.replaceAll(this.uiContext.pathSeparator, "/");
            const testCaseFilter = `${testSuiteRelPath}:${caseInfo.lineNumber}`;
            individualTestCaseFilters.push(testCaseFilter);
        }
        return individualTestCaseFilters.join(" ");
    }
}
