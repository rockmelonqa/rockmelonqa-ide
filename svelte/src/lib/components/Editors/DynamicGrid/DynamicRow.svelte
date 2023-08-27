<script lang="ts">
    import { onMount } from "svelte";

    export let gridRowStyle: string;

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
    class="grid relative overflow-x-visible border-x border-gray-300 {focused ? ' !bg-blue-100' : ''}"
    style={gridRowStyle}
>
    <slot />
</div>
