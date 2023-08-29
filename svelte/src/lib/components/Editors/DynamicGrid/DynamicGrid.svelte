<script lang="ts">
    import DynamicRow from "./DynamicRow.svelte";

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
    let gridBody: HTMLElement;
    let gridBodyOverflowY: boolean = false;
    let gutterSizePx = 3;

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
            gutter: (index, direction) => {
                const gutter = document.createElement("div");
                gutter.className = `gutter relative opacity-1 bg-gray-200 after:bg-gray-400 after:absolute after:top-0 after:h-full after:w-[1px] after:left-[1px] hover:cursor-col-resize hover:opacity-1/2 gutter-${direction}`;
                gutter.style.width = "5px";
                gutter.setAttribute("data-index", String(index));
                return gutter;
            },
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
    <div
        data-role="header-row"
        style={gridRowStyle}
        class="grid bg-gray-200 border-x border-gray-200 {gridBodyOverflowY ? 'pr-4' : ''}"
    >
        {#each config.columns as column, i}
            <div bind:this={cols[i]} data-role="header-col" class="text-gray-800 bg-gray-200 py-4 pl-4 pr-3">
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
                <DynamicRow {gridRowStyle}>
                    <svelte:fragment>
                        <slot name="item" {item} {index} />
                    </svelte:fragment>
                </DynamicRow>
            {/each}
        {/if}
    </div>
</div>

<style>
    :global(.gutter:hover::after),
    :global(.gutter:hover) {
        background-color: var(--color-input-border--focus);
        transition: background-color 0.7s;
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
