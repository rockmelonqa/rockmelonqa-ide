<script lang="ts">
    import DynamicRow from "./DynamicRow.svelte";

    import Spinner from "$lib/components/Spinner.svelte";

    import { afterUpdate, onDestroy, onMount } from "svelte";
    import { DynamicGridSizeCache, type GridConfig } from "./DynamicGrid";
    import Split from "split.js";

    
    export let config: GridConfig;

    type ItemType = $$Generic;
    export let items: ItemType[];
    
    /** If processing, we will show a spinner */
    export let isProcessing = true;
    /** Text to show on the spinner if isProcessing is true */
    export let processingText = "Loading";

    export { cssClass as class };
    let cssClass = "";

    let cols: HTMLElement[] = [];
    let columnSizes: string[] = [];

    let gridBody: HTMLElement;
    let gridBodyOverflowY: boolean = false;
    let gridRowStyle: string;
    let gutterSizePx = 3;

    const checkOverflowBody = () => {
        gridBodyOverflowY = gridBody.scrollHeight > gridBody.clientHeight;
    };

    const setSizes = (sizes: number[]) => {
        columnSizes = sizes.map((n) => `${n}%`);
        gridRowStyle = `grid-template-columns: ${sizes
            .map((n) => `calc((100% - ${(sizes.length - 1) * gutterSizePx}px) * ${n} / 100)`)
            .join(` ${gutterSizePx}px `)}`;
    };

    onMount(() => {
        let sizes = DynamicGridSizeCache.get(config.gridType) ?? [];
        if (config.columns.length !== sizes.length) {
            sizes = config.columns.map((c) => c.size);
        }
        
        const colsSplitInstance = Split(cols, {
            gutterSize: gutterSizePx,
            sizes,
            gutter: (index, direction) => {
                const gutter = document.createElement("div");
                gutter.className = `gutter relative opacity-1 bg-neutral-200 after:bg-neutral-300 after:absolute after:top-0 after:h-full after:w-[1px] after:left-[1px] hover:cursor-col-resize hover:opacity-1/2 gutter-${direction}`;
                gutter.setAttribute("data-index", String(index));
                return gutter;
            },
            onDrag(sizes) {
                setSizes(sizes);
                DynamicGridSizeCache.set(config.gridType, sizes);
                checkOverflowBody();
            },
            elementStyle: function (dimension, size, gutterSize) {
                return {};
            },
        });

        let actualSizes = colsSplitInstance.getSizes();
        setSizes(actualSizes);

        window.addEventListener("resize", onResize);
        
        isProcessing = false;
    });

    const onResize = () => {
        checkOverflowBody();
    }

    afterUpdate(onResize);

    onDestroy(() => {
        window?.removeEventListener("resize", onResize);
    });
</script>

<div
    data-role="table-container"
    {...$$restProps}
    class="overflow-x-auto h-full flex flex-col {cssClass}"
    data-gridBodyOverflowY={gridBodyOverflowY}
>
    <div
        data-role="header-row"
        style={gridRowStyle}
        class="dynamic-grid-header grid bg-neutral-200 border-x border-t {gridBodyOverflowY ? 'pr-4' : ''}"
    >
        {#each config.columns as column, i}
            <div bind:this={cols[i]} data-role="header-col" class="font-semibold p-4">
                {column.title}
            </div>
        {/each}
    </div>

    <div
        data-role="body"
        class="dynamic-grid-body h-full overflow-y-auto overflow-x-visible shadow-sm"
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

    .dynamic-grid-header {
        border-color: var(--color-panel-border);
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
        background-color: rgb(212 212 216);; /* bg-zinc-300 */
    }
</style>
