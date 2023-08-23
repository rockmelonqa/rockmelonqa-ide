<script lang="ts">
    import { onMount } from "svelte";
    import type { GridConfig } from "./DynamicGrid";
    import Split from "split.js";

    type ItemType = $$Generic;
    export let config: GridConfig;
    export let items: ItemType[];

    let cols: HTMLElement[] = [];
    let columnSizes: string[] = [];
    let gridStyle: string;

    onMount(() => {
        let sizes = config.columns.map((c) => c.sizePercentage);
        columnSizes = sizes.map((n) => `${n}%`);
        gridStyle = `grid-template-columns: ${columnSizes.join(" ")};`;
        Split(cols, {
            gutterSize: 4,
            sizes,
            onDrag(sizes) {
                columnSizes = sizes.map((s) => `${s}%`);
                gridStyle = `grid-template-columns: ${columnSizes.join(" ")};`;
            },
        });
    });
</script>

<div data-role="style" class="text-gray-200">
    <div data-role="table-container">
        <div data-role="header" class="text-gray-800 flex flex-row bg-gray-200">
            {#each config.columns as column, i}
                <div bind:this={cols[i]} data-role="col-head" class="py-4 pl-4 pr-3">
                    {column.title}
                </div>
            {/each}
        </div>

        <div data-role="body">
            {#each items as item}
                <div data-role="row" class="grid border-b" style={gridStyle}>
                    <slot name="item" {item} />
                </div>
            {/each}
        </div>
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
</style>
