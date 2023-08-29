<script lang="ts">
    import type { IUiTheme } from '$lib/context/UiTheme';
    /**
     * Wrapper for svelte-select
     * https://github.com/rob-balfre/svelte-select
     */
    import { createEventDispatcher, getContext } from 'svelte';
    import Select from 'svelte-select';
    import type { IDropdownOption } from '../controls/DropdownField';
    import {
        FieldDataType,
        getFieldLabel,
        getFieldPlaceholder,
        isFieldRequired,
        type IDropdownFieldDef,
    } from '../form/FieldDef';
    import { formContextKey, type IFormContext } from '../form/FormContext';
    import { FormDataActionType } from '../form/FormData';

    //*****************************************
    // Props
    //*****************************************
    export let name: string;
    export let readonly: boolean = false;
    export let disabled = false;
    export let label = '';
    export let options: IDropdownOption[];
    export let placeholder = '';
    export let displayLabel = true;

    //*****************************************
    // Init
    //*****************************************
    let formContext: IFormContext = getContext(formContextKey);
    let { formName, mode: formMode, data: formData } = formContext;

    let uiContext = $formData.uiContext;

    let fieldDef = $formData.formDef.fields[name];
    if (!fieldDef) {
        throw new Error(`Field '${name}' not found in the definition`);
    }
    if (fieldDef.dataType !== FieldDataType.Dropdown) {
        throw new Error(`Field '${name}' must be of data type Dropdown to be used with a DropdownField`);
    }

    let { theme } = uiContext;
    let dropdownTheme = ($theme as IUiTheme).fancyDropdownField ?? {};
    let textTheme = ($theme as IUiTheme).textField ?? {};

    const dropdownFieldDef: IDropdownFieldDef = fieldDef;

    $: isReadOnly = readonly || $formMode.isViewing();
    $: isDisabled = disabled || $formMode.isLoading() || $formMode.isProcessing();
    $: isEditable = !isReadOnly && !isDisabled;
    $: isRequired =
        isFieldRequired($formData.values, dropdownFieldDef.isRequired) &&
        ($formMode.isAdding() || $formMode.isEditing());
    $: labelText = getFieldLabel(label, formName, name, fieldDef, uiContext) + (isRequired && isEditable ? ' *' : '');
    $: errorMessage = $formData.errorsToShow[name];

    $: value = $formData.values[name];
    $: selectedItem = options?.find((opt) => opt.key === value);
    $: valueText = selectedItem?.text ?? '';

    // Input only displayed in view mode
    $: inputCssClassReadOnly = isReadOnly ? textTheme.inputReadonly ?? '' : '';
    $: inputCssClassDisabled = isDisabled ? textTheme.inputDisabled ?? '' : '';
    $: inputCssHidden = isEditable ? 'hidden' : '';
    $: inputCssClass = `${textTheme?.input} ${inputCssClassReadOnly} ${inputCssClassDisabled} ${inputCssHidden}`.trim();

    // Best we can do is put a name on the container and then we overrride in app.css
    $: selectCss = errorMessage ? 'select-error' : '';
    $: containerCss = isEditable
        ? `${dropdownTheme?.dropdownContainer} ${errorMessage ? 'error' : 'valid'}`
        : textTheme?.inputContainer;

    $: selectPlaceholder = isEditable ? getFieldPlaceholder(placeholder, formName, name, fieldDef, uiContext) : '';

    let rootId = `${formName}_${name}_root`;
    let labelId = `${formName}_${name}_label`;
    let inputId = `${formName}_${name}_input`;
    let selectId = `${formName}_${name}_select`;
    let errorId = `${formName}_${name}_error`;
    const dispatch = createEventDispatcher();

    //*****************************************
    // Events
    //*****************************************
    const handleSelect = (e: any) => {
        const value = e.detail.key;
        formContext.dataDispatch({ type: FormDataActionType.SetValues, newValues: { [name]: value } });
        dispatch('change', { value: value });
    };

    const handleBlur = (e: any) => {
        if ($formMode.isAdding() || $formMode.isEditing()) {
            formContext.dataDispatch({ type: FormDataActionType.SetEditedField, fieldName: name });
        }
    };

    const handleClear = () => {
        formContext.dataDispatch({ type: FormDataActionType.SetValues, newValues: { [name]: '' } });
        dispatch('change', { value: '' });
    };
</script>

<div id={rootId} class="dropdown-field-root {dropdownTheme.root}">
    {#if displayLabel}
        <label id={labelId} for={name} class="dropdown-field-label {dropdownTheme?.label}">{labelText}</label>
    {/if}
    <div class="dropdown-field-select-container {containerCss}">
        <input
            id={inputId}
            type="text"
            value={valueText}
            readonly={isReadOnly}
            disabled={isDisabled}
            autocomplete="off"
            class={inputCssClass}
        />
        {#if isEditable}
            <Select
                id={selectId}
                items={options}
                value={selectedItem}
                class={selectCss}
                itemId="key"
                label="text"
                placeholder={selectPlaceholder}
                {...$$restProps}
                on:select={handleSelect}
                on:blur={handleBlur}
                on:clear={handleClear}
            />
        {/if}
    </div>
    {#if errorMessage}
        <p id={errorId} class="dropdown-field-error {dropdownTheme?.errorMessage}">{errorMessage}</p>
    {/if}
</div>
