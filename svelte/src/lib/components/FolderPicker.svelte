<script lang="ts">
    import type { IUiTheme } from '$lib/context/UiTheme';
    import { FormDataActionType } from '$lib/form/FormData';
    import { fileSystem } from '$lib/ipc';
    import { getContext } from 'svelte';
    import {
        FieldDataType,
        getFieldLabel,
        getFieldPlaceholder,
        isFieldRequired,
        type ITextFieldDef,
    } from '../form/FieldDef';
    import { formContextKey, type IFormContext } from '../form/FormContext';

    //*****************************************
    // Props
    //*****************************************
    export let name: string;
    export let readonly: boolean = false;
    export let disabled = false;
    export let label = '';
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
    if (fieldDef.dataType !== FieldDataType.Text) {
        throw new Error(`Field '${name}' must be of data type Text to be used with a FolderPicker`);
    }

    let { theme } = uiContext;
    let thisTheme = ($theme as IUiTheme).textField ?? {};

    const textFieldDef: ITextFieldDef = fieldDef;
    let inputElement: HTMLInputElement;

    $: isReadOnly = readonly || $formMode.isViewing();
    $: isDisabled = disabled || $formMode.isLoading() || $formMode.isProcessing();
    $: isEditable = !isReadOnly && !isDisabled;
    $: isRequired =
        isFieldRequired($formData.values, textFieldDef.isRequired) && ($formMode.isAdding() || $formMode.isEditing());
    $: labelText = getFieldLabel(label, formName, name, fieldDef, uiContext) + (isRequired && isEditable ? ' *' : '');
    $: errorMessage = $formData.errorsToShow[name];
    $: value = $formData.values[name] ?? '';

    $: inputCssClassReadOnly = isReadOnly ? thisTheme.inputReadonly ?? '' : '';
    $: inputCssClassDisabled = isDisabled ? thisTheme.inputDisabled ?? '' : '';
    $: inputCssClassError = errorMessage ? `folder-picker-field-error ${thisTheme.inputError ?? ''}` : '';
    $: inputCssClassValid = isEditable && !errorMessage ? thisTheme.inputValid ?? '' : '';
    $: inputCssClass =
        `folder-picker-field-input text-base px-4 ${inputCssClassValid} ${inputCssClassError} ${inputCssClassReadOnly} ${inputCssClassDisabled} 
        border-l-0 rounded-l-none focus:ring-0 focus:border-slate-300`.trim();

    $: inputPlaceholder = isEditable ? getFieldPlaceholder(placeholder, formName, name, fieldDef, uiContext) : '';

    let rootId = `${formName}_${name}_root`;
    let labelId = `${formName}_${name}_label`;
    let inputId = `${formName}_${name}_input`;
    let errorId = `${formName}_${name}_error`;

    //*****************************************
    // Events
    //*****************************************
    const handleBlur = () => {
        if ($formMode.isAdding() || $formMode.isEditing()) {
            formContext.dataDispatch({ type: FormDataActionType.SetEditedField, fieldName: name });
        }
    };

    const handleBrowseClick = async () => {
        const folderPath = await fileSystem.pickFolder();
        formContext.dataDispatch({ type: FormDataActionType.SetValues, newValues: { [name]: folderPath ?? '' } });
        handleBlur();
    };
</script>

<div id={rootId} class="folder-picker-field-root {thisTheme.root}">
    {#if displayLabel}
        <label id={labelId} for={name} class="folder-picker-field-label {thisTheme?.label}">{labelText}</label>
    {/if}
    <div class="folder-picker-field-input-container {thisTheme?.inputContainer}">
        <div class="flex">
            <button
                type="button"
                {disabled}
                class="primary px-6 py-3 border border-transparent font-bold rounded-l-md shadow-sm"
                on:click={handleBrowseClick}
                class:disabled={!isEditable}
                {...$$restProps}
            >
                <span>Browse</span>
            </button>

            <input
                bind:this={inputElement}
                id={inputId}
                {name}
                type="text"
                {value}
                readonly={true}
                placeholder={inputPlaceholder}
                class={inputCssClass}
                aria-invalid={errorMessage}
                {...$$restProps}
                on:blur={handleBlur}
            />
        </div>
    </div>
    {#if errorMessage}
        <p id={errorId} class="folder-picker-field-error {thisTheme?.errorMessage}">{errorMessage}</p>
    {/if}
</div>

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
