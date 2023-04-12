<script lang="ts">
    import { stringResKeys } from '$lib/context/StringResKeys';
    import { uiContextKey, type IUiContext } from '$lib/context/UiContext';
    import { getContext } from 'svelte';
    import { get } from 'svelte/store';
    import { NodeType, type NodeInfo } from './NodeInfo';
    import Nodes from './Nodes.svelte';
    import { TestExplorerActionType, testExplorerContextKey, type ITestExplorerContext } from './TestExplorerContext';

    const uiContext = getContext(uiContextKey) as IUiContext;
    const testExplorerContext = getContext(testExplorerContextKey) as ITestExplorerContext;
    let { state, dispatch: contextDispatch } = testExplorerContext;

    $: open = $state.nodes.length;
    $: containerClass = `treeview-item 
        ${open ? 'treeview-item-opened' : ''} min-w-fit`;
    $: rootItemClass = 'treeview-item-root bg-neutral-200 font-bold';

    $: allSelected = $state.nodes.every(isNodeSelected);
    const isNodeSelected = (node: NodeInfo): boolean => {
        if (node.nodeType === NodeType.Case) {
            return get(node.selected);
        } else if (node.nodeType === NodeType.Suite) {
            return get(node.selected); // && node.children.entries(isNodeSelected);
        } else {
            // NodeType.Folder
            return node.children.every(isNodeSelected);
        }
    };

    const handleSelectAllChange = (e: Event) => {
        const checked = (e.currentTarget as HTMLInputElement).checked;
        contextDispatch({ type: TestExplorerActionType.SelectAllNode, selected: checked });
    };
</script>

<div class={containerClass}>
    <div class={rootItemClass}>
        <input
            id={'selectAll'}
            name={'selectAll'}
            type="checkbox"
            checked={allSelected}
            on:change={handleSelectAllChange}
        />
        <label for="selectAll" class="ml-2">
            {uiContext.str(stringResKeys.runTestDialog.selectAllTests)}
        </label>
    </div>

    <div class="treeview-item-children">
        <Nodes nodes={$state.nodes} />
    </div>
</div>
