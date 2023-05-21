<script lang="ts">
    import { uiContextKey, type IUiContext } from '$lib/context/UiContext';
    import type { IUiTheme } from '$lib/context/UiTheme';
    /**
     * Wrapper for svelte-select
     * https://github.com/rob-balfre/svelte-select
     */
    import { createEventDispatcher, getContext } from 'svelte';
    import Select from 'svelte-select';
    import type { IDropdownOption } from './DropdownField';

    //*****************************************
    // Props
    //*****************************************
    export let name: string;
    export let value: string;
    export let options: IDropdownOption[];
    export let errorMessage: string;

    //*****************************************
    // Init
    //*****************************************
    const dispatch = createEventDispatcher();

    const uiContext = getContext(uiContextKey) as IUiContext;
    let { theme } = uiContext;
    let dropdownTheme = ($theme as IUiTheme).inlineFancyDropdownField ?? {};

    $: selectedItem = options?.find((opt) => opt.key === value);

    // Best we can do is put a name on the container and then we overrride in app.css
    $: selectCss = '';
    $: containerCss = dropdownTheme?.dropdownContainer;

    let rootId = `${name}_root`;
    let selectId = `${name}_select`;

    //*****************************************
    // Events
    //*****************************************
    const handleSelect = (e: any) => {
        const value = e.detail.key;
        dispatch('change', { value });
    };

    const handleClear = () => {
        dispatch('change', { value: '' });
    };
</script>

<div id={rootId} class="dropdown-field-root {dropdownTheme.root}">
    <div class="dropdown-field-select-container {containerCss}">
        <Select
            id={selectId}
            items={options}
            value={selectedItem}
            class={selectCss}
            itemId="key"
            label="text"
            {...$$restProps}
            on:select={handleSelect}
            on:clear={handleClear}
        />
    </div>
    {#if errorMessage}
    <p id={`${selectId}-error`} class="dropdown-field-error absolute {dropdownTheme?.errorMessage}">{errorMessage}</p>
{/if}
</div>
