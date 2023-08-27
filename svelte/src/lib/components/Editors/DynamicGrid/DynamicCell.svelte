<script lang="ts">
    export let isLast: boolean = false;
    export let colspan: number = 1;
</script>

<div data-role="cell" class="border-b text-base {`col-span-${colspan}`}">
    <slot />
</div>
{#if !isLast}
    <div data-role="gutter" class="flex items-center justify-center border-gray-300 border-b">
        <div class="border-l border-gray-300 h-full" />
    </div>
{/if}
