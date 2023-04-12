<script lang="ts">
    import FailedIcon from '$lib/icons/FailedIcon.svelte';
    import PassedIcon from '$lib/icons/PassedIcon.svelte';
    import { TestOutcome } from './trxViewer';

    export let outcome: TestOutcome = TestOutcome.Unknown;

    let cssClass = 'h-6 w-6 ';
    export { cssClass as class };
</script>

{#if outcome === TestOutcome.Passed}
    <!-- text-green-600 -->
    <PassedIcon class={cssClass} color="#16A34A" />
{:else if outcome === TestOutcome.Failed}
    <!-- text-red-600 -->
    <FailedIcon class={cssClass} color="#DC2626" />
{:else}
    <div />
{/if}
