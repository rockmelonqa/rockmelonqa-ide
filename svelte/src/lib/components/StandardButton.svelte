<script lang="ts">
    import { stringResKeys } from '$lib/context/StringResKeys';

    import { uiContextKey, type IUiContext } from '$lib/context/UiContext';

    import { getContext } from 'svelte';
    import type { ButtonType } from './types';

    //******************************************
    // Props
    //******************************************
    /** Unique id for the button element */
    export let id = '';

    /** Label text */
    export let label: string = '';

    /** Button type */
    export let type: ButtonType = 'button';

    /** Additional CSS class */
    export { cssClass as class };
    let cssClass = '';

    export let disabled: boolean = false;
    export let show: boolean = true;

    //******************************************
    // Init
    //******************************************
    const uiContext = getContext(uiContextKey) as IUiContext;
    $: displayLabel = label ? uiContext.str(label) : '';

    $: displayId = getDisplayId(id, label);

    //******************************************
    // Helpers
    //******************************************
    const getDisplayId = (id: string, label: string) => {
        if (id) {
            return id;
        }

        switch (label) {
            case stringResKeys.general.cancel:
                return 'btnCancel';
            case stringResKeys.general.next:
                return 'btnNext';
            case stringResKeys.general.previous:
                return 'btnPrevious';
            case stringResKeys.general.showMore:
                return 'btnShowMore';
            default:
                return '';
        }
    };
</script>

{#if show}
    <button
        id={displayId}
        {type}
        {disabled}
        class="{cssClass} standard px-6 py-3 border border-transparent font-bold rounded-md shadow-sm text-slate-500 bg-slate-50 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 border-slate-500"
        class:disabled
        on:click
        on:focus
        on:blur
    >
        {#if displayLabel}
            <span>{displayLabel}</span>
        {/if}
        <slot />
    </button>
{/if}

<style>
    button.standard {
        font-family: var(--font-family--condensed);
        border-color: var(--color-button-border--standard);
        color: var(--color-secondary--dark);
        min-width: 100px;
    }
    button.standard:hover {
        font-family: var(--font-family--condensed);
        border-color: var(--color-button-border--standard);
        color: var(--color-highlight--extra-bright);
        background-color: var(--color-highlight--bright);
    }
    button.standard.disabled {
        border-color: var(--color-button-border--standard);
        background-color: var(--color-button--disabled);
        color: var(--color-secondary--dark);
    }
</style>
