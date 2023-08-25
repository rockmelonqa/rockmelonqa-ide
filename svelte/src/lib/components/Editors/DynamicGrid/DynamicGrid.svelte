<script lang="ts">
    import { afterUpdate, onMount } from "svelte";
    import { DynamicGridSizeCache, type GridConfig } from "./DynamicGrid";
    import Split from "split.js";

    type ItemType = $$Generic;
    export let config: GridConfig;
    export let items: ItemType[];

    let cols: HTMLElement[] = [];
    let columnSizes: string[] = [];
    let gridStyle: string;
    let gridBody: HTMLElement;
    let gridBodyOverflow: boolean = false;
    export { cssClass as class };
    let cssClass = "";

    const checkOverflowBody = () => {
        gridBodyOverflow = gridBody.scrollHeight > gridBody.clientHeight;
    };

    onMount(() => {
        let cachedSizes = DynamicGridSizeCache.getByCollectionType(config.gridType);
        let sizes = cachedSizes;
        if (!sizes) {
            sizes = config.columns.map((c) => c.defaultSizePercentage);
        }
        columnSizes = sizes.map((n) => `${n}%`);
        gridStyle = `grid-template-columns: ${columnSizes.join(" ")};`;
        Split(cols, {
            gutterSize: 4,
            sizes,
            onDrag(sizes) {
                columnSizes = sizes.map((s) => `${s}%`);
                gridStyle = `grid-template-columns: ${columnSizes.join(" ")};`;
                DynamicGridSizeCache.setByCollectionType(config.gridType, sizes);
                checkOverflowBody();
            },
        });
    });

    afterUpdate(() => {
        console.log("afterUpdate()", gridBody.clientHeight, gridBody.scrollHeight);
        checkOverflowBody();
    });
</script>

<div data-role="table-container" {...$$restProps} class={cssClass}>
    <div data-role="header" class="text-gray-800 flex flex-row bg-gray-200 {gridBodyOverflow ? 'pr-4' : ''}">
        {#each config.columns as column, i}
            <div bind:this={cols[i]} data-role="col-head" class="py-4 pl-4 pr-3">
                {column.title}
            </div>
        {/each}
    </div>

    <div data-role="body" class="h-full overflow-y-auto border-b dynamic-grid-body" bind:this={gridBody}>
        {#each items as item, index}
            <div data-role="row" class="grid border-b" style={gridStyle}>
                <slot name="item" {item} {index} />
            </div>
        {/each}
    </div>
</div>

<style>
    :global(.gutter) {
        background-color: #c2c2c2;
        background-repeat: no-repeat;
        background-position: 50%;
    }

    :global(.gutter.gutter-horizontal:hover) {
        cursor: col-resize;
    }

    .dynamic-grid-body::-webkit-scrollbar {
        width: 1em;
        overflow-y: overlay;
    }

    .dynamic-grid-body::-webkit-scrollbar-track {
        box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
    }

    .dynamic-grid-body::-webkit-scrollbar-thumb {
        background-color: darkgrey;
        outline: 1px solid rgb(208, 208, 208);
    }
</style>
