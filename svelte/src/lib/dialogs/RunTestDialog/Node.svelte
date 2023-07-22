<script lang="ts">
    import FolderIcon from "$lib/icons/FolderIcon.svelte";
    import TCaseIcon from "$lib/icons/TCaseIcon.svelte";
    import TSuiteIcon from "$lib/icons/TSuiteIcon.svelte";
    import { getContext } from "svelte";
    import { NodeInfo, NodeType } from "./NodeInfo";
    import { TestExplorerActionType, testExplorerContextKey, type ITestExplorerContext } from "./TestExplorerContext";

    export let node: NodeInfo;
    export let level: number = 0;

    const { selected } = node;

    const testExplorerContext = getContext(testExplorerContextKey) as ITestExplorerContext;
    let { state, dispatch: contextDispatch } = testExplorerContext;

    $: label = node.name;
    $: type = node.nodeType;
    $: hasChildren = node.children.length > 0;
    $: children = node.children;

    $: toggleable = type == NodeType.Suite;
    $: selectable = true;
    $: showToggleIcon = hasChildren;
    $: expanded = node.expanded;

    $: containerClass = `treeview-item 
        ${expanded ? "treeview-item-opened" : ""}`;
    $: rootItemClass = `treeview-item-root relative
        ${toggleable ? "treeview-item-toggle" : ""} 
        ${selectable ? "treeview-item-selectable" : ""} 
        min-w-fit`;
    $: rootItemStyle = `padding-left: calc(var(--f7-treeview-item-padding-left) + var(--f7-treeview-children-offset) * ${level})`;

    let handleClick = async () => {
        node.expanded = !node.expanded;
    };

    let handleSelectChange = (e: Event) => {
        const checked = (e.currentTarget as HTMLInputElement).checked;
        contextDispatch({ type: TestExplorerActionType.SelectNode, node: node, selected: checked });
    };
</script>

<div class={containerClass}>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class={rootItemClass} style={rootItemStyle}>
        {#if showToggleIcon}
            <button class="treeview-toggle" on:click={handleClick} />
        {/if}
        <div class="treeview-item-content">
            {#if type === NodeType.Folder}
                <FolderIcon class="h-5 w-5" />
            {:else if type === NodeType.Suite}
                <TSuiteIcon class="h-5 w-5" />
            {:else if type === NodeType.Case}
                <TCaseIcon class="h-5 w-5" />
            {/if}

            <div class="treeview-item-label whitespace-nowrap">
                {#if type === NodeType.Folder}
                    <span class="ml-2">{label}</span>
                {:else if type === NodeType.Suite && node.suiteInfo !== undefined}
                    <input
                        id={node.suiteInfo.fullyQualifiedName}
                        name={node.suiteInfo.fullyQualifiedName}
                        type="checkbox"
                        checked={$selected}
                        on:change={handleSelectChange}
                    />
                    <label for={node.suiteInfo.fullyQualifiedName} class="ml-2">{label}</label>
                {:else if type === NodeType.Case && node.caseInfo !== undefined}
                    <input
                        id={node.caseInfo.fullyQualifiedName}
                        name={node.caseInfo.fullyQualifiedName}
                        type="checkbox"
                        checked={$selected}
                        on:change={handleSelectChange}
                    />
                    <label for={node.caseInfo.fullyQualifiedName} class="ml-2">{label}</label>
                {/if}
            </div>
        </div>
    </div>
    {#if hasChildren}
        <div class="treeview-item-children">
            {#each children ?? [] as child}
                <svelte:self node={child} level={level + 1} />
            {/each}
        </div>
    {/if}
</div>
