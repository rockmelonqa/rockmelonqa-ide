<script lang="ts">
    // Reference: https://svelte.dev/repl/16c8a02ebaa9425a9cbbfd66feea1a9e?version=3.29.0
    import getWindow from '$lib/utils/getWindow';
    import { createEventDispatcher, setContext } from 'svelte';
    import { fade } from 'svelte/transition';
    import { menuContextKey } from './Menu';

    export let x: number;
    export let y: number;
    const window = getWindow();

    // whenever x and y is changed, restrict box to be within bounds
    $: handlePositionChanged(x, y);
    const handlePositionChanged = (x: number, y: number) => {
        if (!menuEl) return;

        const rect = menuEl.getBoundingClientRect();
        x = Math.min(window!.innerWidth - rect.width, x);
        if (y > window!.innerHeight - rect.height) y -= rect.height;
    };

    setContext(menuContextKey, {
        /** Click event on Menu panel */
        dispatchClick: () => dispatch('click'),
    });

    let menuEl: any;
    const dispatch = createEventDispatcher();
    const onPageClick = (e: any) => {
        if (e.target === menuEl || menuEl.contains(e.target)) return;
        dispatch('clickoutside');
    };
</script>

<svelte:body on:click={onPageClick} />

<div
    bind:this={menuEl}
    class="menu absolute border bg-white rounded z-10"
    style="top: {y}px; left: {x}px; border-color: var(--color-panel-border); box-shadow: 2px 2px 5px 0px #0002"
    transition:fade={{ duration: 100 }}
>
    <slot />
</div>
