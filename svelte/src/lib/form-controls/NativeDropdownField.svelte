<script lang="ts">
    import type { IUiTheme } from '$lib/context/UiTheme';
    import { createEventDispatcher, getContext } from 'svelte';
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
    let dropdownTheme = ($theme as IUiTheme).nativeDropdownField ?? {};
    let textTheme = ($theme as IUiTheme).textField ?? {};

    const dropdownFieldDef: IDropdownFieldDef = fieldDef;
    let nativeSelectElement: HTMLSelectElement;

    $: isReadOnly = readonly || $formMode.isViewing();
    $: isDisabled = disabled || $formMode.isLoading() || $formMode.isProcessing();
    $: isEditable = !isReadOnly && !isDisabled;
    $: isRequired =
        isFieldRequired($formData.values, dropdownFieldDef.isRequired) &&
        ($formMode.isAdding() || $formMode.isEditing());
    $: labelText = getFieldLabel(label, formName, name, fieldDef, uiContext) + (isRequired && isEditable ? ' *' : '');
    $: errorMessage = $formData.errorsToShow[name];

    $: value = $formData.values[name];
    $: valueText = options?.find((opt) => opt.key === value)?.text ?? '';

    // Input only displayed in view mode
    $: inputCssClassReadOnly = isReadOnly ? textTheme.inputReadonly ?? '' : '';
    $: inputCssClassDisabled = isDisabled ? textTheme.inputDisabled ?? '' : '';
    $: inputCssHidden = isEditable ? 'hidden' : '';
    $: inputCssClass = `${textTheme?.input} ${inputCssClassReadOnly} ${inputCssClassDisabled} ${inputCssHidden}`.trim();

    // Select display when adding or editing
    $: selectCssIfVisible = errorMessage
        ? `select-error ${dropdownTheme?.select} ${dropdownTheme?.selectError}`
        : `${dropdownTheme?.select} ${dropdownTheme?.selectValid}`;
    $: selectCss = isEditable ? selectCssIfVisible : 'hidden';
    $: containerCss = isEditable ? dropdownTheme?.dropdownContainer : textTheme?.inputContainer;

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
    const handleChange = (e: Event) => {
        const value = options[nativeSelectElement.selectedIndex].key;
        formContext.dataDispatch({ type: FormDataActionType.SetValues, newValues: { [name]: value } });
        dispatch('change', { value: value });
    };

    const handleBlur = (e: any) => {
        if ($formMode.isAdding() || $formMode.isEditing()) {
            formContext.dataDispatch({ type: FormDataActionType.SetEditedField, fieldName: name });
        }
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
        <select
            bind:this={nativeSelectElement}
            id={selectId}
            class={selectCss}
            {value}
            placeholder={selectPlaceholder}
            {...$$restProps}
            on:change={handleChange}
            on:blur={handleBlur}
            on:change
            on:blur
            on:focus
        >
            {#each options as option}
                <option value={option.key}>
                    {option.text}
                </option>
            {/each}
        </select>
    </div>
    {#if errorMessage}
        <p id={errorId} class="dropdown-field-error {dropdownTheme?.errorMessage}">{errorMessage}</p>
    {/if}
</div>
