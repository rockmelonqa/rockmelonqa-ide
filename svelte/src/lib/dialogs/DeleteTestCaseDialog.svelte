<script lang="ts">
    import PrimaryButton from '$lib/components/PrimaryButton.svelte';
    import StandardButton from '$lib/components/StandardButton.svelte';
    import { stringResKeys } from '$lib/context/StringResKeys';
    import { uiContextKey, type IUiContext } from '$lib/context/UiContext';
    import type { ITestSuite } from 'rockmelonqa.common';
    import { getContext, onDestroy, onMount } from 'svelte';

    export let showDialog: boolean = false;
    export let relatedSuites: ITestSuite[] = [];

    const uiContext = getContext(uiContextKey) as IUiContext;
    

    onMount(async () => {
        
    });

    onDestroy(() => {
       
    });

    const handleDeleteClick = () => {
        showDialog = false;
        
    };
    const handleCloseClick = () => {
        showDialog = false;
        
    };
</script>

{#if showDialog}
    <div class="relative" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="fixed inset-0 bg-gray-400 bg-opacity-75 transition-opacity" />
        <div class="fixed inset-0 overflow-y-auto">
            <div class="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
                <div
                    class="modal-panel relative bg-white rounded-lg p-4 sm:p-6
                    text-left shadow-xl transform transition-all max-w-xl w-full"
                >
                    <div class="modal-title text-xl leading-6 font-bold mb-8">
                        {uiContext.str(stringResKeys.deleteTestCaseDialog.deleteTestCase)}
                    </div>
                    <div class="modal-content mb-8 flex flex-col gap-y-4">
                        {#if relatedSuites.length}
                        <div>{uiContext.str(stringResKeys.deleteTestCaseDialog.relatedSuitesMessage)}</div>
                        {/if}
                    </div>
                    <div class="modal-buttons flex justify-start items-end gap-x-4">
                        <div class="ml-auto">
                                <PrimaryButton
                                    label={uiContext.str(stringResKeys.general.delete)}
                                    class="mr-4"
                                    on:click={handleDeleteClick}
                                />
                            <StandardButton
                                label={uiContext.str(stringResKeys.general.close)}
                                on:click={handleCloseClick}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
    :global(.modal-title) {
        color: var(--color-brand);
    }
</style>
