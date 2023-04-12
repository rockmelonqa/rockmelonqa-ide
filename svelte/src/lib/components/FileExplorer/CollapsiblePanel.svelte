<script lang="ts">
    import { slide } from 'svelte/transition';
    export let title: string = '';
    export let open: boolean = false;

    const handleToggle = () => {
        open = !open;
    };

    $: containerClass = `treeview-item
        ${open ? 'treeview-item-opened' : ''} min-w-fit`;
    $: rootItemClass = 'treeview-item-root treeview-item-toggle bg-neutral-200';
</script>

<div class={containerClass}>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class={rootItemClass} on:click={handleToggle}>
        <div class="treeview-toggle" />
        <div class="font-medium uppercase truncate">{title}</div>
    </div>

    <div class="treeview-item-children" transition:slide|local>
        <slot name="body" />
    </div>
</div>
