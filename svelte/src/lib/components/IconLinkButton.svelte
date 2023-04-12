<script lang="ts">
    import type { ButtonType } from './types';

    //******************************************
    // Props
    //******************************************
    /** Unique id for the button element */
    export let id = '';

    /** Button type */
    export let type: ButtonType = 'button';

    /** Additoinal CSS class */
    export { cssClass as class };
    let cssClass = '';

    /** Flag to show the button or not */
    export let show: boolean = true;

    export let disabled: boolean = false;

    export let title = '';
</script>

{#if show}
    <button
        {id}
        {type}
        class="{cssClass} icon-link-button border-none font-bold"
        {disabled}
        on:click
        on:focus
        on:blur
        {title}
    >
        <div class="flex items-center gap-x-2">
            {#if $$slots.icon}
                <span class="icon-link-button-icon"><slot name="icon" /></span>
            {/if}
            <span class="icon-link-button-label"><slot name="label" /></span>
        </div>
    </button>
{/if}

<style>
    .icon-link-button {
        color: var(--color-brand);
    }
    .icon-link-button:hover {
        text-decoration: underline;
    }

    /* Force svelte to output this class as global - otherwise it would be ignored since we are referring to the child svg */
    :global(.icon-link-button .icon-link-button-icon svg) {
        /** w-5 h-5 */
        height: 1.25rem;
        width: 1.25rem;
    }
</style>
