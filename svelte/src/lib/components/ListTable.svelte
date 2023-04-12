<script lang="ts">
    import { stringResKeys } from '$lib/context/StringResKeys';
    import { uiContextKey, type IUiContext } from '$lib/context/UiContext';
    import { createEventDispatcher, getContext } from 'svelte';
    import Spinner from './Spinner.svelte';
    import StandardButton from './StandardButton.svelte';

    //******************************************
    // Props
    //******************************************
    /** Unique id for the button element */
    export let id = '';

    /** Additoinal CSS class */
    export { cssClass as class };
    let cssClass = '';

    /** If processing, we will show a spinner */
    export let isProcessing = false;

    /** Text to show on the spinner if isProcessing is true */
    export let processingText = '';

    /** If we have more rows, we will prompt to show more */
    export let hasMoreRows = false;

    /** If we don't have rows to show */
    export let isEmpty = true;

    //******************************************
    // Init
    //******************************************
    const dispatch = createEventDispatcher();
    let uiContext = getContext(uiContextKey) as IUiContext;
    $: spinnerText = processingText ? processingText : uiContext.str(stringResKeys.general.searching);

    //******************************************
    // Event Handlers
    //******************************************
    const handleShowMoreClick = () => {
        dispatch('showmore');
    };
</script>

<table {id} class="list-table w-full {cssClass}">
    <thead class="bg-slate-100">
        <tr class="border-t border-b border-slate-300">
            <slot name="header" />
        </tr>
    </thead>
    {#if !isProcessing && !isEmpty}
        <tbody class="bg-white">
            <slot name="body" />
        </tbody>
    {/if}
</table>

{#if isProcessing}
    <div class="mt-4">
        <Spinner textRight={spinnerText} />
    </div>
{/if}
{#if isEmpty && !isProcessing}
    <div class="pl-3.5 mt-4">
        {uiContext.str(stringResKeys.general.noRecordsFound)}
    </div>
{/if}
{#if !isEmpty && !isProcessing && hasMoreRows}
    <div class="mt-8">
        <StandardButton label={stringResKeys.general.showMore} on:click={handleShowMoreClick} />
    </div>
{/if}

<style>
    /** For div tag to keep the line-height even when the content is empty*/
    :global(.empty-line:empty::after) {
        content: '.';
        visibility: hidden;
    }
    :global(a.list-table-link) {
        color: var(--color-brand--dark);
    }
    :global(a.list-table-link:hover) {
        color: var(--color-brand--dark);
        text-decoration: underline;
        text-underline-offset: 3px;
    }
</style>
