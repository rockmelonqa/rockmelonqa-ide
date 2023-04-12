<script lang="ts">
    import { uiContextKey, type IUiContext } from '$lib/context/UiContext';
    import { UiParserFormatter } from '$lib/context/UiParserFormatter';
    import { getContext } from 'svelte';
    import { toTitle } from '../Editor';
    import TestOutcomeIcon from './TestOutcomeIcon.svelte';
    import { formatDuration, type ITestResult } from './trxViewer';

    export let testResult: ITestResult;

    const uiContext = getContext(uiContextKey) as IUiContext;
    const uiParserFormatter = new UiParserFormatter(uiContext);

    $: hasError = testResult.errorInfo !== undefined;
    let showError: boolean = false;

    const toggleShowError = () => {
        showError = !showError;
    };
</script>

<div class="test-result px-4">
    <div class="leading-10 truncate flex items-center gap-x-2">
        <TestOutcomeIcon outcome={testResult.outcome} />
        <span>{toTitle(testResult.name)}</span>
        {#if hasError}
            <span>(<a href={'#'} on:click={toggleShowError}>View error</a>)</span>
        {/if}
        <div class="ml-auto">
            <span class="test-duration text-right">
                {formatDuration(uiParserFormatter, testResult.duration)}
            </span>
        </div>
    </div>
    {#if showError}
        <div class="mb-4 px-8 py-4 bg-neutral-100 flex flex-col gap-y-4">
            {#if testResult.errorInfo?.message}
                <p>
                    <b>[Message]</b>:<br />
                    {@html testResult.errorInfo.message.replace(new RegExp(uiContext.eol, 'g'), '<br/>')}
                </p>
            {/if}
            {#if testResult.errorInfo?.stackTrace}
                <p>
                    <b>[Stack Trace]</b>:<br />
                    {@html testResult.errorInfo.stackTrace.replace(new RegExp(uiContext.eol, 'g'), '<br/>')}
                </p>
            {/if}
        </div>
    {/if}
</div>

<style>
    a {
        color: var(--color-brand);
        cursor: pointer;
    }

    .test-result:not(:first-child) {
        border-top: 1px solid var(--color-panel-border);
    }

    .test-duration {
        min-width: 56px;
    }
</style>
