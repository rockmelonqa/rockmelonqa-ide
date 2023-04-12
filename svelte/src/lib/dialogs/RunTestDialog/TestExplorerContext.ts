/* eslint-disable no-debugger */
import { get, writable, type Readable } from 'svelte/store';
import { NodeType, type NodeInfo } from './NodeInfo';

export interface ITestExplorerState {
    nodes: NodeInfo[];
}

const initialState: ITestExplorerState = {
    nodes: [],
};

/**
 * Actions supported
 */
export enum TestExplorerActionType {
    Load = 'Load',
    SelectAllNode = 'SelectAllNode',
    SelectNode = 'SelectNode',
}

/**
 * Actions that can be performed on a state
 */
export type TestExplorerAction =
    | { type: TestExplorerActionType.Load; nodes: NodeInfo[] }
    | { type: TestExplorerActionType.SelectNode; node: NodeInfo; selected: boolean }
    | { type: TestExplorerActionType.SelectAllNode; selected: boolean };

export interface ITestExplorerContext {
    state: Readable<ITestExplorerState>;
    dispatch: (action: TestExplorerAction) => void;
}

export function createTestExplorerContext(): ITestExplorerContext {
    const { update, subscribe } = writable(initialState);

    function dispatch(action: TestExplorerAction) {
        update((state) => contextReducer(state, action));
    }

    // Return the context
    return {
        state: { subscribe },
        dispatch,
    };
}

/**
 * Key used to get testExplorerContext
 */
export const testExplorerContextKey = Symbol();

/**
 * Reducer function to change state
 *
 * @param state
 * @param action
 */
function contextReducer(state: ITestExplorerState, action: TestExplorerAction): ITestExplorerState {
    switch (action.type) {
        case TestExplorerActionType.Load: {
            return { ...initialState, nodes: action.nodes };
        }
        case TestExplorerActionType.SelectNode: {
            const { node, selected } = action;
            if (node.nodeType === NodeType.Suite) {
                node.selected.set(selected);
                node.children.forEach((c) => c.selected.set(selected));
            } else if (node.nodeType === NodeType.Case) {
                node.selected.set(selected);
                const suiteNode = node.parent;
                if (suiteNode) {
                    const allCasesSelected = suiteNode.children.every((c) => get(c.selected));
                    if (get(suiteNode.selected) !== allCasesSelected) {
                        suiteNode.selected.set(allCasesSelected);
                    }
                }
            }

            return { ...state };
        }
        case TestExplorerActionType.SelectAllNode: {
            const newNodes = [...state.nodes];
            setSelected(newNodes, action.selected);
            return { ...state, nodes: newNodes };
        }
        default:
            return { ...state };
    }
}

/**
 * Set `selected` to given nodes and their descendant (recursively)
 */
function setSelected(nodes: NodeInfo[], selected: boolean): void {
    for (const node of nodes) {
        if (node.nodeType === NodeType.Suite || node.nodeType === NodeType.Case) {
            node.selected.set(selected);
        }
        if (node.children) {
            setSelected(node.children, selected);
        }
    }
}
