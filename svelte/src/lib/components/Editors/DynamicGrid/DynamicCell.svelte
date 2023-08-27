<script lang="ts">
    import { onMount } from "svelte";

    export let isLast: boolean = false;
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
    class="relative bg-transparent border-b text-base {`col-span-${colspan}`} px-[2px]"
>
    {#if allowHighlight}
        <div
            data-role="background"
            class="absolute top-0 bottom-0 left-[-2px] right-[-2px] bg-transparent {focused ? ' !bg-blue-300' : ''}"
        />
    {/if}
    <slot />
</div>
{#if !isLast}
    <div data-role="cell-gutter" class="flex items-center justify-center border-gray-300 border-b">
        <div class="border-l border-gray-300 h-full" />
    </div>
{/if}

<style>
    :global([data-role="cell"]:first-child [data-role="background"]) {
        left: 0;
    }

    :global([data-role="cell-gutter"]:last-child) {
        display: none;
    }
</style>
