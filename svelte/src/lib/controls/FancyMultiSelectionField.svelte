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
    export let values: string[];
    export let options: IDropdownOption[];

    //*****************************************
    // Init
    //*****************************************
    const dispatch = createEventDispatcher();

    const uiContext = getContext(uiContextKey) as IUiContext;
    let { theme } = uiContext;
    let dropdownTheme = ($theme as IUiTheme).inlineFancyDropdownField ?? {};

    $: selectedItems = options?.filter((opt) => values?.includes(opt.key));

    // Best we can do is put a name on the container and then we overrride in app.css
    $: selectCss = '';
    $: containerCss = dropdownTheme?.dropdownContainer;

    let rootId = `${name}_root`;
    let selectId = `${name}_select`;

    //*****************************************
    // Events
    //*****************************************
    const handleSelect = (e: any) => {
        const selection = e.detail.key;
        const selectedValues = [...values];
        if (!selectedValues.includes(selection)) {
            selectedValues.push(selection);
        }
        
        dispatch('change', { value: selectedValues });
    };

    const handleClear = (e: any) => {
        let selection: string[] = [];

        if (Array.isArray(e.detail)) {
            selection = [...e.detail.map((x: IDropdownOption) => x.key)];
        } else {
            selection.push(e.detail.key);
        }
        
        const remainingValues = values.filter((x) => !selection.includes(x));
        dispatch('change', { value: remainingValues });
    };
</script>

<div id={rootId} class="dropdown-field-root {dropdownTheme.root}">
    <div class="dropdown-field-select-container {containerCss}">
        <Select
            id={selectId}
            items={options}
            value={selectedItems}
            class={selectCss}
            itemId="key"
            label="text"
            multiple={true}
            {...$$restProps}
            on:select={handleSelect}
            on:clear={handleClear}
        />
    </div>
</div>
