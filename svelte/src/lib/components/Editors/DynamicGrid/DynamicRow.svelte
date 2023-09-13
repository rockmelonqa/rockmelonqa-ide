<script lang="ts">
    import { onMount } from "svelte";

    export let gridRowStyle: string;
    export let zIndex: number = 0;

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
    data-role="row"
    class="dynamic-grid-row grid relative overflow-x-visible border-x {focused ? ' focused' : ''}"
    style="{gridRowStyle}; z-index: {zIndex}"
>
    <slot />
</div>

<style>
    .dynamic-grid-row {
        border-color: var(--color-panel-border);
    }

    .dynamic-grid-row.focused {
        /* Same as `.treeview-item-selected.treeview-item-root` in app.css */
        background-color: var(--f7-treeview-selectable-selected-bg-color, rgba(var(--f7-theme-color-rgb), 0.2)) !important;
    }
</style>
