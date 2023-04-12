<script lang="ts">
    /**
     * Show a popup dialog when type !== AlertDialogType.None
     *
     * The button that was clicked will be set in the on:click event handler parameter: event.detail.button
     *
     * const handler = (event: any) => {
     * 	 console.log(event.detail.button);
     * };
     */

    import { stringResKeys } from '$lib/context/StringResKeys';
    import { uiContextKey, type IUiContext } from '$lib/context/UiContext';
    import ErrorIcon from '$lib/icons/ErrorIcon.svelte';
    import InfoIcon from '$lib/icons/InfoIcon.svelte';
    import QuestionIcon from '$lib/icons/QuestionIcon.svelte';
    import SuccessIcon from '$lib/icons/SuccessIcon.svelte';
    import WarningIcon from '$lib/icons/WarningIcon.svelte';
    import { createEventDispatcher, getContext } from 'svelte';
    import { AlertDialogButtons, AlertDialogType } from './Alert';
    import PrimaryButton from './PrimaryButton.svelte';
    import StandardButton from './StandardButton.svelte';

    //***************************************
    // Props
    //***************************************
    export let id: string = '';
    export let type: AlertDialogType = AlertDialogType.None;
    export let buttons: AlertDialogButtons = AlertDialogButtons.None;

    //***************************************
    // Init
    //***************************************
    let uiContext = getContext(uiContextKey) as IUiContext;
    const dispatch = createEventDispatcher();

    const dialogButtonCssClass = 'inline-flex justify-center ml-2';
    $: alertPanelClass = `alert-dialog-panel-${type.toString().toLocaleLowerCase()}`;

    //***************************************
    // Event handlers
    //***************************************
    const handleClick = (buttonName: string) => {
        type = AlertDialogType.None;
        dispatch('click', { button: buttonName });
    };
</script>

{#if type !== AlertDialogType.None}
    <div {id} class="alert-dialog relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <!--
            Background backdrop, show/hide based on modal state.

            Entering: "ease-out duration-300"
                From: "opacity-0"
                To: "opacity-100"
            Leaving: "ease-in duration-200"
                From: "opacity-100"
                To: "opacity-0"
        -->
        <div class="alert-dialog-backdrop fixed inset-0 bg-gray-400 bg-opacity-75 transition-opacity" />

        <div class="fixed z-10 inset-0 overflow-y-auto">
            <div class="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
                <!--
                    Modal panel, show/hide based on modal state.

                    Entering: "ease-out duration-300"
                        From: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        To: "opacity-100 translate-y-0 sm:scale-100"
                    Leaving: "ease-in duration-200"
                        From: "opacity-100 translate-y-0 sm:scale-100"
                        To: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                -->
                <div
                    class="alert-dialog-panel {alertPanelClass} relative bg-white rounded-lg p-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full sm:p-6"
                >
                    <div class="sm:flex sm:items-start">
                        <div
                            class="alert-dialog-icon mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10"
                        >
                            {#if type === AlertDialogType.Error}
                                <ErrorIcon class="h-14 w-14" fill="currentColor" strokeColor="white" />
                            {:else if type === AlertDialogType.Info}
                                <InfoIcon class="h-12 w-12" fill="currentColor" strokeColor="white" />
                            {:else if type === AlertDialogType.Question}
                                <QuestionIcon class="h-12 w-12" fill="currentColor" questionMarkColor="white" />
                            {:else if type === AlertDialogType.Success}
                                <SuccessIcon class="h-12 w-12" />
                            {:else if type === AlertDialogType.Warning}
                                <WarningIcon class="h-12 w-12" fill="currentColor" strokeColor="white" />
                            {/if}
                        </div>
                        <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                            <div class="alert-dialog-title text-xl leading-6 font-bold mb-4" id="modal-title">
                                <slot name="title" />
                            </div>
                            <div class="alert-dialog-content">
                                <slot name="content" />
                            </div>
                        </div>
                    </div>
                    <div class="alert-dialog-buttons mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        {#if buttons === AlertDialogButtons.DeleteCancel}
                            <StandardButton
                                id="btnAlertDialogCancel"
                                label={stringResKeys.general.cancel}
                                class="alert-dialog-button-cancel {dialogButtonCssClass}"
                                on:click={() => handleClick('cancel')}
                            />
                            <PrimaryButton
                                id="btnAlertDialogDelete"
                                label={stringResKeys.general.delete}
                                class="alert-dialog-button-delete {dialogButtonCssClass}"
                                on:click={() => handleClick('delete')}
                            />
                        {:else if buttons === AlertDialogButtons.Done}
                            <PrimaryButton
                                id="btnAlertDialogDone"
                                label={stringResKeys.general.done}
                                class="alert-dialog-button-done {dialogButtonCssClass}"
                                on:click={() => handleClick('done')}
                            />
                        {:else if buttons === AlertDialogButtons.Ok}
                            <PrimaryButton
                                id="btnAlertDialogOk"
                                class="alert-dialog-button-ok {dialogButtonCssClass}"
                                on:click={() => handleClick('ok')}
                            >
                                {uiContext.str(stringResKeys.general.ok)}
                            </PrimaryButton>
                        {:else if buttons === AlertDialogButtons.OkCancel}
                            <StandardButton
                                id="btnAlertDialogCancel"
                                label={stringResKeys.general.cancel}
                                class="alert-dialog-button-cancel {dialogButtonCssClass}"
                                on:click={() => handleClick('cancel')}
                            />
                            <PrimaryButton
                                id="btnAlertDialogOk"
                                label={stringResKeys.general.ok}
                                class="alert-dialog-button-ok {dialogButtonCssClass}"
                            />
                        {:else if buttons === AlertDialogButtons.YesNo}
                            <StandardButton
                                id="btnAlertDialogNo"
                                label={stringResKeys.general.no}
                                class="alert-dialog-button-no {dialogButtonCssClass}"
                                on:click={() => handleClick('no')}
                            />
                            <PrimaryButton
                                id="btnAlertDialogYes"
                                label={stringResKeys.general.yes}
                                class="alert-dialog-button-yes {dialogButtonCssClass}"
                                on:click={() => handleClick('yes')}
                            />
                        {:else if buttons === AlertDialogButtons.YesNoCancel}
                            <StandardButton
                                id="btnAlertDialogCancel"
                                label={stringResKeys.general.cancel}
                                class="alert-dialog-button-cancel {dialogButtonCssClass}"
                                on:click={() => handleClick('cancel')}
                            />
                            <StandardButton
                                id="btnAlertDialogNo"
                                label={stringResKeys.general.no}
                                class="alert-dialog-button-no {dialogButtonCssClass}"
                                on:click={() => handleClick('no')}
                            />
                            <PrimaryButton
                                id="btnAlertDialogYes"
                                label={stringResKeys.general.yes}
                                class="alert-dialog-button-yes {dialogButtonCssClass}"
                                on:click={() => handleClick('yes')}
                            />
                        {/if}
                    </div>
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
    .alert-dialog-panel {
        background-color: var(--color-white);
    }
    .alert-dialog-panel .alert-dialog-title {
        color: var(--color-secondary--extra-dark);
    }
    .alert-dialog-panel .alert-dialog-content {
        color: var(--color-secondary--extra-dark);
    }

    .alert-dialog .alert-dialog-panel-question .alert-dialog-icon {
        background-color: var(--color-white);
        color: var(--color-info--dark);
    }
    .alert-dialog .alert-dialog-panel-success .alert-dialog-icon {
        background-color: var(--color-white);
        color: var(--color-success);
    }
    .alert-dialog .alert-dialog-panel-warning .alert-dialog-icon {
        /* background-color: var(--color-secondary--extra-dark);
        color: var(--color-warning); */
        background-color: var(--color-white);
        color: var(--color-alert--bright);
    }
    .alert-dialog .alert-dialog-panel-info .alert-dialog-icon {
        background-color: var(--color-white);
        color: var(--color-info--dark);
    }
    .alert-dialog .alert-dialog-panel-error .alert-dialog-icon {
        color: var(--color-alert);
        background-color: var(--color-white);
    }

    :global(#btnAlertDialogDelete) {
        background-color: var(--color-alert);
    }
</style>
