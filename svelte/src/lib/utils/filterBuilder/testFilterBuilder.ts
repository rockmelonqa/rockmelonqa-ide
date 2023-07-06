import type { NodeInfo } from "$lib/dialogs/RunTestDialog/NodeInfo";
import type { IUiContext } from "$lib/context/UiContext";

export interface ITestFilterBuilder {
    build(selectedTestCases: NodeInfo[]): string;
}

export class TestFilterBuilderBase {
    protected uiContext: IUiContext;
    constructor(uiContext: IUiContext) {
        this.uiContext = uiContext;
    }
}
