<script lang="ts">
    import { getContext } from 'svelte';

    import { createEventDispatcher } from 'svelte';
    import { menuContextKey } from './Menu';

    export let disabled = false;
    export let label = '';

    const dispatch = createEventDispatcher();
    const { dispatchClick } = getContext(menuContextKey) as any;
    const handleClick = () => {
        if (disabled) return;

        dispatch('click'); // Click event on menu item (e.g. to do something)
        dispatchClick(); // Click event on menu panel (e.g. to close context-menu panel)
    };

    $: classes = `menu-item 
        py-3 px-6 cursor-pointer bg-white w-64
        ${disabled ? 'disabled text-gray-400' : 'hover:bg-neutral-200'}`;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class={classes} on:click={handleClick}>
    {#if label}
        {label}
    {:else}
        <slot />
    {/if}
</div>

<style>
</style>
