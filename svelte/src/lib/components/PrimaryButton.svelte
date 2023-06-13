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
            case stringResKeys.general.add:
                return 'btnAdd';
            case stringResKeys.general.edit:
                return 'btnEdit';
            case stringResKeys.general.save:
                return 'btnSave';
            case stringResKeys.general.delete:
                return 'btnDelete';
            case stringResKeys.general.done:
                return 'btnDone';
            case stringResKeys.general.ok:
                return 'btnOk';
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
        class="{cssClass} primary px-6 py-3 border border-transparent font-bold rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
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
    button.primary {
        background-color: var(--color-brand);
        opacity: 0.84;
        color: var(--color-white);
        font-family: var(--font-family--condensed);
        min-width: 100px;
    }

    button.primary:hover {
        background-color: var(--color-brand--dark);
        opacity: 1;
        color: var(--color-white);
        font-family: var(--font-family--condensed);
    }
    button.primary.disabled {
        border-color: var(--color-button-border--standard);
        background-color: var(--color-button--disabled);
        color: var(--color-secondary--dark);
    }
</style>
