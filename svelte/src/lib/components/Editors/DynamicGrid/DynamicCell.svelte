<script lang="ts">
    import { onMount } from "svelte";

    export let colspan: number = 1;
    export let allowHighlight = true;
    export { cssClass as class };
    let cssClass = "";

    let element: HTMLElement;
    let focused: boolean = false;
    onMount(() => {
        element.addEventListener("focusout", function (e: any) {
            if (e.currentTarget.contains(e.relatedTarget)) {
                focused = true;
            } else {
                focused = false;
            }
        });

        element.addEventListener("focusin", function (e: any) {
            focused = true;
        });
    });
</script>

<div
    bind:this={element}
    data-role="cell"
    class="dynamic-grid-cell relative border-b text-base {`col-span-${colspan}`} px-[2px] {focused
        ? ' focused'
        : ''} {cssClass}"
>
    {#if allowHighlight}
        <div
            data-role="background"
            class="absolute top-0 bottom-0 left-[-2px] right-[-2px] {focused ? ' !bg-blue-400 ' : ''}"
        />
    {/if}
    <slot />
</div>

<div data-role="cell-gutter" class="dynamic-grid-cell-gutter flex items-center justify-center border-b">
    <div class="border-l h-full" />
</div>

<style>
    .dynamic-grid-cell:first-child [data-role="background"] {
        left: 0;
    }

    :global(.dynamic-grid-cell .text-field-input, .dynamic-grid-cell .dropdown-field-root .svelte-select) {
        background-color: transparent !important;
    }

    :global(
            .dynamic-grid-cell.focused .text-field-input,
            .dynamic-grid-cell.focused .dropdown-field-root .svelte-select
        ) {
        color: white !important;
    }

    :global(
        .dynamic-grid-cell.focused .text-field-root.expandable .text-field-input) {
        background-color: rgb(96 165 250) !important;   /* bg-blue-400 */
    }

    :global(.dynamic-grid-cell .dropdown-field-root .dropdown-field-select-container) {
        position: relative;
        height: 100%;
        border-bottom-width: 0 !important;
    }

    :global(.dynamic-grid-cell.focused .dropdown-field-root .svelte-select input::placeholder) {
        color: lightgray;
    }

    :global(.dynamic-grid-cell.focused .dropdown-field-root .svelte-select-list) {
        color: var(--color-secondary--extra-dark);
    }

    .dynamic-grid-cell-gutter,
    .dynamic-grid-cell-gutter > div {
        border-color: var(--color-panel-border);
    }

    .dynamic-grid-cell-gutter:last-child {
        display: none;
    }
</style>
