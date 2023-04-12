import lodash from 'lodash';
import type { ISuiteInfo, ITestCaseInfo } from 'rockmelonqa.common/codegen/types';
import { writable } from 'svelte/store';

export enum NodeType {
    Folder = 'Folder',
    Suite = 'Suite',
    Case = 'Case',
}

export class NodeInfo {
    name = ''; /** Node label */
    parent?: NodeInfo; /** Undefined or null for root node */
    nodeType: NodeType = NodeType.Suite;

    children: NodeInfo[] = [];
    expanded = false; /** Represent collapse or expanding state */
    selected = writable(false);

    suiteInfo?: ISuiteInfo;
    caseInfo?: ITestCaseInfo;

    constructor(params: {
        name: string;
        nodeType: NodeType;
        children?: NodeInfo[];
        parent?: NodeInfo;
        selected?: boolean;
        suiteInfo?: ISuiteInfo;
        caseInfo?: ITestCaseInfo;
    }) {
        this.name = params.name;
        this.nodeType = params.nodeType;
        this.children = params.children ?? [];
        this.parent = params.parent;
        this.selected.set(params.selected ?? false);
        this.suiteInfo = params.suiteInfo;
        this.caseInfo = params.caseInfo;
    }

    static sort(nodes: NodeInfo[]): NodeInfo[] {
        // sort by folder-file, then name alphabet
        return lodash.sortBy(
            nodes,
            function (f) {
                return f.nodeType != NodeType.Folder;
            },
            'name'
        );
    }
}
