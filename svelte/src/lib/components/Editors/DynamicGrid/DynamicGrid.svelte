<script lang="ts">
    import Spinner from "$lib/components/Spinner.svelte";

    import { afterUpdate, onMount } from "svelte";
    import { DynamicGridSizeCache, type GridConfig } from "./DynamicGrid";
    import Split from "split.js";

    type ItemType = $$Generic;
    export let config: GridConfig;
    export let items: ItemType[];
    /** If processing, we will show a spinner */
    export let isProcessing = true;
    /** Text to show on the spinner if isProcessing is true */
    export let processingText = "Loading";
    export { cssClass as class };
    let cssClass = "";

    let cols: HTMLElement[] = [];
    let columnSizes: string[] = [];
    let gridRowStyle: string;
    let gridHeadStyle: string;
    let gridBody: HTMLElement;
    let gridBodyOverflowY: boolean = false;
    let gutterSizePx = 4;

    const checkOverflowBody = () => {
        // console.log(
        //     "checkOverflowBody()",
        //     gridBody.scrollHeight,
        //     gridBody.clientHeight,
        //     gridBody.scrollHeight > gridBody.clientHeight
        // );
        gridBodyOverflowY = gridBody.scrollHeight > gridBody.clientHeight;
    };

    const setSizes = (sizes: number[]) => {
        columnSizes = sizes.map((n) => `${n}%`);
        gridRowStyle = `grid-template-columns: ${sizes
            .map((n) => `calc((100% - ${(sizes.length - 1) * gutterSizePx}px) * ${n} / 100)`)
            .join(` ${gutterSizePx}px `)}`;
        gridHeadStyle = `grid-template-columns: ${sizes
            .map((n) => `calc((100% - ${(sizes.length - 1) * gutterSizePx}px) * ${n} / 100)`)
            .join(` ${gutterSizePx}px `)};`;
    };

    onMount(() => {
        let cachedSizes = DynamicGridSizeCache.getByCollectionType(config.gridType);
        let sizes = cachedSizes;
        if (!sizes || config.columns.length !== cachedSizes?.length) {
            sizes = config.columns.map((c) => c.defaultSizePercentage);
        }
        const colsSplitInstance = Split(cols, {
            gutterSize: gutterSizePx,
            sizes,
            onDrag(sizes) {
                setSizes(sizes);
                DynamicGridSizeCache.setByCollectionType(config.gridType, sizes);
                checkOverflowBody();
            },
            elementStyle: function (dimension, size, gutterSize) {
                return {};
            },
        });

        let actualSizes = colsSplitInstance.getSizes();

        setSizes(actualSizes);

        window.addEventListener("resize", () => {
            checkOverflowBody();
        });
        isProcessing = false;
    });

    afterUpdate(() => {
        checkOverflowBody();
    });
</script>

<div
    data-role="table-container"
    {...$$restProps}
    class="overflow-x-auto {cssClass} flex flex-col"
    data-gridBodyOverflowY={gridBodyOverflowY}
>
    <div data-role="header" style={gridHeadStyle} class="grid bg-gray-200 {gridBodyOverflowY ? 'pr-4' : ''}">
        {#each config.columns as column, i}
            <div bind:this={cols[i]} data-role="col-head" class="text-gray-800 bg-gray-200 py-4 pl-4 pr-3">
                {column.title}
            </div>
        {/each}
    </div>

    <div
        data-role="body"
        class="h-full overflow-y-auto overflow-x-visible dynamic-grid-body shadow-sm"
        bind:this={gridBody}
    >
        {#if isProcessing}
            <div class="mt-4">
                <Spinner textRight={processingText} />
            </div>
        {/if}
        {#if !isProcessing}
            {#each items as item, index}
                <div data-role="row" class="grid overflow-x-visible border-x border-gray-300" style={gridRowStyle}>
                    <slot name="item" {item} {index} />
                </div>
            {/each}
        {/if}
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
    .dynamic-grid-body::-webkit-scrollbar:horizontal {
        display: none;
    }

    .dynamic-grid-body::-webkit-scrollbar-track {
        box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
    }

    .dynamic-grid-body::-webkit-scrollbar-thumb {
        background-color: darkgrey;
        outline: 1px solid rgb(208, 208, 208);
    }

    :global(.my-test) {
        position: absolute;
        width: 100%;
        left: 0;
    }
</style>
