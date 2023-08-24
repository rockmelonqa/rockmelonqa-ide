<script lang="ts">
    export let isLast: boolean = false;
    export let colspan: number = 1;
</script>

<div data-role="cell" class="text-base border-l {isLast ? 'border-r' : ''} {`col-span-${colspan}`}">
    <slot />
</div>
