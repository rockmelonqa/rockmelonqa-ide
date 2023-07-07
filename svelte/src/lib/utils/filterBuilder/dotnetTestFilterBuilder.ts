import type { IUiContext } from "$lib/context/UiContext";
import type { NodeInfo } from "$lib/dialogs/RunTestDialog/NodeInfo";
import { TestFilterBuilderBase, type ITestFilterBuilder } from "./testFilterBuilder";

/** Filter Builder for `dotnet test` command */
export class DotnetTestFilterBuilder extends TestFilterBuilderBase implements ITestFilterBuilder {
    constructor(uiContext: IUiContext) {
        super(uiContext);
    }
    build(selectedTestCases: NodeInfo[]) {
        return selectedTestCases
            .map((node) => node.caseInfo?.fullyQualifiedName)
            .filter((x) => x)
            .join("|");
    }
}
