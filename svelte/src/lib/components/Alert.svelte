<script lang="ts">
    import { stringResKeys } from '$lib/context/StringResKeys';
    import { uiContextKey, type IUiContext } from '$lib/context/UiContext';
    import DismissIcon from '$lib/icons/DismissIcon.svelte';
    import ErrorIcon from '$lib/icons/ErrorIcon.svelte';
    import InfoIcon from '$lib/icons/InfoIcon.svelte';
    import SuccessIcon from '$lib/icons/SuccessIcon.svelte';
    import WarningIcon from '$lib/icons/WarningIcon.svelte';
    import { getContext } from 'svelte';
    import { AlertLevel } from './Alert';

    //*****************************************
    // Props
    //*****************************************
    /** Unique id for the root div */
    export let id: string = 'alertBox';

    /** Styling of the alert */
    export let alertLevel: AlertLevel = AlertLevel.None;

    /** Show Dismiss button? */
    export let dismissable = true;

    /** Additional CSS classes to add */
    export { cssClass as class };
    let cssClass = '';

    //*****************************************
    // Init
    //*****************************************
    let uiContext = getContext(uiContextKey) as IUiContext;
    const iconCssClass = 'h-8 w-8';

    let titleText = '';
    $: {
        switch (alertLevel) {
            case AlertLevel.Success:
                titleText = uiContext.str(stringResKeys.general.success);
                break;
            case AlertLevel.Error:
                titleText = uiContext.str(stringResKeys.general.error);
                break;
            case AlertLevel.Info:
                titleText = uiContext.str(stringResKeys.general.info);
                break;
            case AlertLevel.Warning:
                titleText = uiContext.str(stringResKeys.general.warning);
                break;
            default:
                titleText = uiContext.str(stringResKeys.general.info);
                break;
        }
    }

    //*****************************************
    // Event handlers
    //*****************************************
    const handleDismissClick = async () => {
        alertLevel = AlertLevel.None;
    };
</script>

{#if alertLevel !== AlertLevel.None}
    <!-- TODO Transitions -->
    <div {id} class="alert {`alert-${alertLevel.toString().toLowerCase()}`} {cssClass} rounded-md p-8">
        <div class="flex items-center">
            <div class="flex-shrink-0" style="padding-top: 2px;">
                {#if alertLevel === AlertLevel.Success}
                    <SuccessIcon class={iconCssClass} />
                {:else if alertLevel === AlertLevel.Error}
                    <ErrorIcon class={iconCssClass} />
                {:else if alertLevel === AlertLevel.Warning}
                    <WarningIcon class={iconCssClass} />
                {:else if alertLevel === AlertLevel.Info}
                    <InfoIcon class={iconCssClass} />
                {/if}
            </div>
            <div class="ml-3">
                <div class="alert-title text-lg font-medium">
                    {#if $$slots.title}
                        <slot name="title" />
                    {:else}
                        {titleText}
                    {/if}
                </div>
                {#if $$slots.content}
                    <div class="alert-content mt-3 text-base">
                        <slot name="content" />
                    </div>
                {/if}
                {#if $$slots.actions}
                    <div class="alert-actions mt-8">
                        <slot name="actions" />
                    </div>
                {/if}
            </div>
            {#if dismissable}
                <div class="ml-auto pl-3">
                    <div class="-mx-1.5 -my-1.5">
                        <button
                            type="button"
                            class="dismiss-button inline-flex rounded-md p-1.5"
                            on:click={handleDismissClick}
                            title={uiContext.str(stringResKeys.general.dismiss)}
                        >
                            <DismissIcon class={iconCssClass} />
                        </button>
                    </div>
                </div>
            {/if}
        </div>
    </div>
{/if}

<style>
    div.alert {
        font-family: var(--font-family--default);
    }

    div.alert.alert-success {
        background-color: var(--color-success);
        color: var(--color-white);
    }
    div.alert.alert-success button.dismiss-button {
        background-color: var(--color-success);
        color: var(--color-white);
    }
    div.alert.alert-success button.dismiss-button:hover {
        color: var(--color-success);
        background-color: var(--color-white);
    }
    :global(div.alert.alert-success .alert-actions button) {
        background-color: var(--color-success);
        color: var(--color-white);
        border: 1px solid var(--color-white);
    }
    :global(div.alert.alert-success .alert-actions button:hover) {
        color: var(--color-success);
        background-color: var(--color-white);
    }

    div.alert.alert-error {
        background-color: var(--color-alert);
        color: var(--color-white);
    }
    div.alert.alert-error button.dismiss-button {
        background-color: var(--color-alert);
        color: var(--color-white);
    }
    div.alert.alert-error button.dismiss-button:hover {
        color: var(--color-alert);
        background-color: var(--color-white);
    }
    :global(div.alert.alert-error .alert-actions button) {
        background-color: var(--color-alert);
        color: var(--color-white);
        border: 1px solid var(--color-white);
    }
    :global(div.alert.alert-error .alert-actions button:hover) {
        color: var(--color-alert);
        background-color: var(--color-white);
    }

    div.alert.alert-warning {
        background-color: var(--color-warning);
        color: var(--color-secondary--extra-dark);
    }
    div.alert.alert-warning button.dismiss-button {
        background-color: var(--color-warning);
        color: var(--color-secondary--extra-dark);
    }
    div.alert.alert-warning button.dismiss-button:hover {
        color: var(--color-warning);
        background-color: var(--color-secondary--extra-dark);
    }
    :global(div.alert.alert-warning .alert-actions button) {
        background-color: var(--color-warning);
        color: var(--color-secondary--extra-dark);
        border: 1px solid var(--color-secondary--extra-dark);
    }
    :global(div.alert.alert-warning .alert-actions button:hover) {
        color: var(--color-warning);
        background-color: var(--color-secondary--extra-dark);
    }

    div.alert.alert-info {
        background-color: var(--color-info);
        color: var(--color-secondary--extra-dark);
    }
    div.alert.alert-info button.dismiss-button {
        background-color: var(--color-info);
        color: var(--color-secondary--extra-dark);
    }
    div.alert.alert-info button.dismiss-button:hover {
        color: var(--color-info);
        background-color: var(--color-info--dark);
    }
    :global(div.alert.alert-info div.alert-actions button) {
        background-color: var(--color-info);
        color: var(--color-secondary--extra-dark);
        border: 1px solid var(--color-secondary--extra-dark);
    }
    :global(div.alert.alert-info div.alert-actions button:hover) {
        color: var(--color-info);
        background-color: var(--color-info--dark);
    }

    :global(div.alert div.alert-actions button) {
        /* px-3*/
        padding-left: 0.75rem;
        padding-right: 0.75rem;

        /*py-1.5*/
        padding-top: 0.375rem;
        padding-bottom: 0.375rem;

        /* rounded-md */
        border-radius: 0.375rem;

        /* text-base */
        font-size: 1rem /* 16px */;
        line-height: 1.5rem /* 24px */;

        /*font-medium*/
        font-weight: 500;
    }
</style>
