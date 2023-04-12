<script lang="ts">
    export let outcome: string;
    export let count: number;

    export let highlight: boolean = false;
</script>

<a class={`outcome-counter px-4 py-2 flex items-center gap-x-2 ${highlight ? 'highlight' : ''}`} href={'#'} on:click>
    <slot name="icon" />
    {outcome}
    <span
        class={`counter rounded-3xl text-center px-2 
            ${highlight ? 'bg-slate-300' : 'bg-slate-200'}`}
    >
        {count}
    </span>
</a>

<style>
    .outcome-counter {
        border: 1px solid var(--color-panel-border);
    }

    .outcome-counter.highlight,
    .outcome-counter:hover {
        background-color: var(--color-highlight--bright);
    }

    :global(.outcome-counter + .outcome-counter) {
        margin-left: -1px;
    }

    .outcome-counter:first-child {
        border-top-left-radius: 0.375rem;
        border-bottom-left-radius: 0.375rem;
    }

    .outcome-counter:last-child {
        border-top-right-radius: 0.375rem;
        border-bottom-right-radius: 0.375rem;
    }

    .counter {
        border: 1px solid transparent;
    }
</style>
