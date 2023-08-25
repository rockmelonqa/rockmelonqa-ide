<script lang="ts">
    import type { ITextFieldTheme, IUiTheme } from "$lib/context/UiTheme";
    import { createEventDispatcher, getContext } from "svelte";
    import {
        FieldDataType,
        getFieldLabel,
        getFieldPlaceholder,
        isFieldRequired,
        type ITextFieldDef,
    } from "../form/FieldDef";
    import { formContextKey, type IFormContext } from "../form/FormContext";
    import { FormDataActionType } from "../form/FormData";

    //*****************************************
    // Props
    //*****************************************
    export let name: string;
    export let type = "text";
    export let readonly: boolean = false;
    export let disabled = false;
    export let label = "";
    export let autoComplete: string = "off";
    export let placeholder = "";
    export let displayLabel = true;
    export let prefixLabel = "";
    export let prefixPadding = "";
    export let suffixLabel = "";
    export let suffixPadding = "";
    export let isRightAligned = false;
    export { cssClass as class };
    let cssClass = "";

    let desiredTheme: ITextFieldTheme | undefined = undefined;
    export { desiredTheme as theme };

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
        throw new Error(`Field '${name}' must be of data type Text to be used with a TextField`);
    }

    let { theme } = uiContext;
    const defaultTheme = ($theme as IUiTheme).textField ?? {};
    const thisTheme = desiredTheme ?? defaultTheme;

    const textFieldDef: ITextFieldDef = fieldDef;
    let inputElement: HTMLInputElement;

    $: isReadOnly = readonly || $formMode.isViewing();
    $: isDisabled = disabled || $formMode.isLoading() || $formMode.isProcessing();
    $: isEditable = !isReadOnly && !isDisabled;
    $: isRequired =
        isFieldRequired($formData.values, textFieldDef.isRequired) && ($formMode.isAdding() || $formMode.isEditing());
    $: labelText = getFieldLabel(label, formName, name, fieldDef, uiContext) + (isRequired && isEditable ? " *" : "");
    $: errorMessage = $formData.errorsToShow[name];
    $: value = $formData.values[name] ?? "";

    $: inputCssClassReadOnly = isReadOnly ? thisTheme.inputReadonly ?? "" : "";
    $: inputCssClassDisabled = isDisabled ? thisTheme.inputDisabled ?? "" : "";
    $: inputCssClassError = errorMessage ? `text-field-error ${thisTheme.inputError ?? ""}` : "";
    $: inputCssClassValid = isEditable && !errorMessage ? thisTheme.inputValid ?? "" : "";
    $: inputCssClass =
        `${thisTheme?.input} ${inputCssClassValid} ${inputCssClassError} ${inputCssClassReadOnly} ${inputCssClassDisabled} ${cssClass}`.trim();

    $: inputStyle = (
        `${prefixPadding ? "padding-left: " + prefixPadding + "; " : " "}` +
        `${suffixPadding ? "padding-right: " + suffixPadding + "; " : " "}` +
        `${isRightAligned ? "text-align: right; " : " "}`
    ).trim();

    $: inputPlaceholder = isEditable ? getFieldPlaceholder(placeholder, formName, name, fieldDef, uiContext) : "";

    let rootId = `${formName}_${name}_root`;
    let labelId = `${formName}_${name}_label`;
    let inputId = `${formName}_${name}_input`;
    let errorId = `${formName}_${name}_error`;

    //*****************************************
    // Events
    //*****************************************
    const dispatch = createEventDispatcher();

    const handleInput = (e: any) => {
        const value = inputElement.value;
        formContext.dataDispatch({ type: FormDataActionType.SetValues, newValues: { [name]: value } });
        dispatch("input", { value });
    };

    const handleBlur = (e: any) => {
        if ($formMode.isAdding() || $formMode.isEditing()) {
            formContext.dataDispatch({ type: FormDataActionType.SetEditedField, fieldName: name });
        }
    };
</script>

<div id={rootId} class="text-field-root {thisTheme.root}">
    {#if displayLabel}
        <label id={labelId} for={name} class="text-field-label {thisTheme?.label}">{labelText}</label>
    {/if}
    <div class="text-field-input-container {thisTheme?.inputContainer}">
        {#if prefixLabel}
            <div class={thisTheme?.prefixContainer}>
                <span class={thisTheme?.prefix}>{prefixLabel}</span>
            </div>
        {/if}
        {#if $$slots.prefix}
            <div class={thisTheme?.prefixContainer}>
                <slot name="prefix" />
            </div>
        {/if}
        <input
            bind:this={inputElement}
            id={inputId}
            {name}
            {type}
            {value}
            readonly={isReadOnly}
            disabled={isDisabled}
            autocomplete={autoComplete ?? "off"}
            placeholder={inputPlaceholder}
            class={inputCssClass}
            style={inputStyle}
            aria-invalid={errorMessage}
            {...$$restProps}
            on:input={handleInput}
            on:blur={handleBlur}
            on:change
            on:blur
            on:focus
        />
        {#if suffixLabel}
            <div class={thisTheme?.suffixContainer}>
                <span class={thisTheme?.suffix}>{suffixLabel}</span>
            </div>
        {/if}
        {#if $$slots.suffix}
            <div class={thisTheme?.suffixContainer}>
                <slot name="suffix" />
            </div>
        {/if}
    </div>
    {#if errorMessage}
        <p id={errorId} class="text-field-error {thisTheme?.errorMessage}">{errorMessage}</p>
    {/if}
</div>
