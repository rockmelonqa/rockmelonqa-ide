<script lang="ts">
    import { onMount } from "svelte";

    export let colspan: number = 1;
    export let allowHighlight = true;

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
    class="relative bg-transparent border-b text-base {`col-span-${colspan}`} px-[2px] {focused
        ? ' focused !text-white'
        : ''}"
>
    {#if allowHighlight}
        <div
            data-role="background"
            class="absolute top-0 bottom-0 left-[-2px] right-[-2px] bg-transparent {focused ? ' !bg-blue-400 ' : ''}"
        />
    {/if}
    <slot />
</div>

<div data-role="cell-gutter" class="flex items-center justify-center  border-b">
    <div class="border-l h-full" />
</div>


<style>
    :global([data-role="cell"]:first-child [data-role="background"]) {
        left: 0;
    }

    :global([data-role="cell"].focused .dropdown-field-root .value-container) {
        color: white;
    }

    :global([data-role="cell"].focused .dropdown-field-root .value-container input::placeholder) {
        color: lightgray;
    }
    :global([data-role="cell"].focused .dropdown-field-root .svelte-select-list) {
        color: grey;
    }
    :global([data-role="cell-gutter"]:last-child) {
        display: none;
    }

    div[data-role="cell-gutter"], div[data-role="cell-gutter"] > div {
        border-color: var(--color-panel-border);
    }
</style>
