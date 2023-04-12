<script lang="ts">
    import { toTitle } from '../Editor';
    import TestResult from './TestResult.svelte';
    import type { ITestSuiteModel } from './trxViewer';

    export let suite: ITestSuiteModel;
    export let expanded: boolean = true;

    const handleToggle = () => {
        expanded = !expanded;
    };
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
    class={`test-suite cursor-pointer rounded-md bg-neutral-100 px-4 leading-10 
        flex items-center ${expanded ? 'expanded' : ''}`}
    on:click={handleToggle}
>
    <div class="treeview-toggle" />
    <div class="truncate">{toTitle(suite.name)}</div>
</div>
<div class={`test-results ${!expanded ? 'hidden' : ''}`}>
    {#each suite.testResults as testResult (testResult.name)}
        <TestResult {testResult} />
    {/each}
</div>

<style>
    .test-suite {
        border: 1px solid var(--color-panel-border);
    }

    .test-suite:not(:first-child) {
        margin-top: 1.5rem;
    }

    .test-suite.expanded {
        border-bottom: none;
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
    }

    .test-suite.expanded > .treeview-toggle:after {
        transform: translate(-50%, -50%) rotate(90deg);
    }

    .test-results {
        border: 1px solid var(--color-panel-border);
        border-bottom-left-radius: 0.375rem;
        border-bottom-right-radius: 0.375rem;
    }
</style>
