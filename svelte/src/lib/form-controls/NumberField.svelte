<script lang="ts">
    import { UiParserFormatter } from '$lib/context/UiParserFormatter';
    import { UiStringResKeys } from '$lib/context/UiStringResKeys';
    import type { IUiTheme } from '$lib/context/UiTheme';
    /**
     * Display integer and floats
     *
     * - "displayValue" is the the formatted text string in the text box that the user sees
     * - "formData[name]" is the numeric field in the form data
     * - "onBlur" we
     *   - parse displayValue
     *   - set formData[name] to the parsed displayValue
     *   - set displayValue to the formatted parsed displayValue so we display the right format
     */
    import { getContext } from 'svelte';
    import {
        FieldDataType,
        getFieldLabel,
        getFieldPlaceholder,
        isFieldRequired,
        type IFloatFieldDef,
        type IIntegerFieldDef,
        type INullableFloatFieldDef,
        type INullableIntegerFieldDef,
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
    export let autoComplete: string = 'off';
    export let placeholder = '';
    export let displayLabel = true;
    export let prefixLabel = '';
    export let prefixPadding = '';
    export let suffixLabel = '';
    export let suffixPadding = '';
    export let isRightAligned = false;

    //*****************************************
    // Init
    //*****************************************
    let formContext: IFormContext = getContext(formContextKey);
    let { formName, mode: formMode, data: formData } = formContext;

    let uiContext = $formData.uiContext;
    let parserFormatter = new UiParserFormatter(uiContext);

    let fieldDef = $formData.formDef.fields[name];
    if (!fieldDef) {
        throw new Error(`Field '${name}' not found in the definition`);
    }
    if (
        fieldDef.dataType !== FieldDataType.Integer &&
        fieldDef.dataType !== FieldDataType.Float &&
        fieldDef.dataType !== FieldDataType.NullableInteger &&
        fieldDef.dataType !== FieldDataType.NullableFloat
    ) {
        throw new Error(
            `Field '${name}' must be of data type Integer/NullableInteger or Float/NullableFloat to be used with a NumberField`
        );
    }

    let { theme } = uiContext;
    let thisTheme = ($theme as IUiTheme).numberField ?? {};

    const numberFieldDef: IIntegerFieldDef | IFloatFieldDef | INullableIntegerFieldDef | INullableFloatFieldDef =
        fieldDef;
    let inputElement: HTMLInputElement;

    $: isReadOnly = readonly || $formMode.isViewing();
    $: isDisabled = disabled || $formMode.isLoading() || $formMode.isProcessing();
    $: isEditable = !isReadOnly && !isDisabled;
    $: isRequired =
        isFieldRequired($formData.values, numberFieldDef.isRequired) && ($formMode.isAdding() || $formMode.isEditing());
    $: labelText = getFieldLabel(label, formName, name, fieldDef, uiContext) + (isRequired && isEditable ? ' *' : '');
    $: errorMessage = $formData.errorsToShow[name];

    $: displayValue =
        $formData.values[name] === '' || $formData.values[name] === null || $formData.values[name] === undefined
            ? ''
            : fieldDef.dataType === FieldDataType.Integer || fieldDef.dataType === FieldDataType.NullableInteger
            ? parserFormatter.formatInteger(
                  $formData.values[name],
                  numberFieldDef.format,
                  fieldDef.dataType === FieldDataType.Integer && (numberFieldDef as IIntegerFieldDef).isBlankWhenZero
              )
            : parserFormatter.formatFloat(
                  $formData.values[name],
                  numberFieldDef.format,
                  fieldDef.dataType === FieldDataType.Float && (numberFieldDef as IFloatFieldDef).isBlankWhenZero
              );

    $: inputCssClassReadOnly = isReadOnly ? thisTheme.inputReadonly ?? '' : '';
    $: inputCssClassDisabled = isDisabled ? thisTheme.inputDisabled ?? '' : '';
    $: inputCssClassError = errorMessage ? `number-field-error ${thisTheme.inputError ?? ''}` : '';
    $: inputCssClassValid = isEditable && !errorMessage ? thisTheme.inputValid ?? '' : '';
    $: inputCssClass =
        `${thisTheme?.input} ${inputCssClassValid} ${inputCssClassError} ${inputCssClassReadOnly} ${inputCssClassDisabled}`.trim();

    $: inputStyle = (
        `${prefixPadding ? 'padding-left: ' + prefixPadding + '; ' : ' '}` +
        `${suffixPadding ? 'padding-right: ' + suffixPadding + '; ' : ' '}` +
        `${isRightAligned ? 'text-align: right; ' : ' '}`
    ).trim();

    $: inputPlaceholder = isEditable ? getFieldPlaceholder(placeholder, formName, name, fieldDef, uiContext) : '';

    let rootId = `${formName}_${name}_root`;
    let labelId = `${formName}_${name}_label`;
    let inputId = `${formName}_${name}_input`;
    let errorId = `${formName}_${name}_error`;

    //*****************************************
    // Helpers
    //*****************************************

    const handleIntegerChange = (strValue: string) => {
        const isNullable = fieldDef.dataType === FieldDataType.NullableInteger;
        const defaultValue = isNullable ? null : 0;
        let numberValue: number | null = defaultValue;

        if (strValue) {
            numberValue =
                parserFormatter.parseInteger(strValue, (numberFieldDef as IIntegerFieldDef).isBlankWhenZero) ??
                defaultValue;
        }

        formContext.dataDispatch({ type: FormDataActionType.SetValues, newValues: { [name]: numberValue } });
    };

    const handleFloatChange = (strValue: string) => {
        const isNullable = fieldDef.dataType === FieldDataType.NullableFloat;
        const defaultValue = isNullable ? null : 0;
        let numberValue: number | null = defaultValue;

        if (strValue) {
            numberValue =
                parserFormatter.parseFloat(
                    strValue,
                    (fieldDef as IFloatFieldDef).format?.precision,
                    (numberFieldDef as IFloatFieldDef).isBlankWhenZero
                ) ?? defaultValue;
        }

        formContext.dataDispatch({ type: FormDataActionType.SetValues, newValues: { [name]: numberValue } });
    };

    //*****************************************
    // Events
    //*****************************************

    const handleInput = (e: any) => {
        // Handle change for integer immediately
        if (fieldDef.dataType === FieldDataType.NullableInteger || fieldDef.dataType === FieldDataType.Integer) {
            handleIntegerChange(e.currentTarget.value);
            return;
        }
    };

    const handleBlur = async (e: any) => {
        // Flag that the field has been edited and we can show error messages
        if ($formMode.isAdding() || $formMode.isEditing()) {
            formContext.dataDispatch({ type: FormDataActionType.SetEditedField, fieldName: name });
        }
        if (fieldDef.dataType === FieldDataType.NullableInteger || fieldDef.dataType === FieldDataType.Integer) {
            handleIntegerChange(e.currentTarget.value);
            return;
        }
        handleFloatChange(e.currentTarget.value);
    };

    const handleKeyDown = (e: any) => {
        var keyCode = e.charCode || e.keyCode || 0;
        if (
            (e.key == 'c' && (e.ctrlKey || e.metaKey)) ||
            (e.key == 'v' && (e.ctrlKey || e.metaKey)) ||
            (e.key == 'x' && (e.ctrlKey || e.metaKey)) ||
            e.key == ',' ||
            e.key == '.' ||
            e.key == ' ' ||
            e.key == '-' ||
            e.key == '0' ||
            e.key == '1' ||
            e.key == '2' ||
            e.key == '3' ||
            e.key == '4' ||
            e.key == '5' ||
            e.key == '6' ||
            e.key == '7' ||
            e.key == '8' ||
            e.key == '9' ||
            keyCode == 8 || // backspace
            keyCode == 9 || // tab
            keyCode == 13 || // enter
            keyCode == 46 || // delete
            (keyCode >= 35 && keyCode <= 40) // arrows, home, end
        ) {
            // Do Nothing - allow keys to flow through
        } else {
            //console.log(e.key + ' ' + e.keyCode + ' ' + e.charCode);
            e.preventDefault();
        }
    };

    const handlePaste = (e: any) => {
        // Strip out non number characters on paste
        let pasteData = e?.clipboardData?.getData('text') ?? '';
        var pattern =
            fieldDef.dataType !== FieldDataType.Integer
                ? uiContext.str(UiStringResKeys.integerRegExp)
                : uiContext.str(UiStringResKeys.floatRegExp);
        pattern = pattern.replace('[', '[^');
        var regexp = new RegExp(pattern, 'g');
        pasteData = pasteData.replaceAll(regexp, '');

        if (pasteData) {
            let newValue = e.target.selectionStart > 0 ? e.target.value.substring(0, e.target.selectionStart) : '';
            newValue = newValue + pasteData;
            newValue =
                newValue +
                (e.target.selectionEnd < e.target.value.length ? e.target.value.substring(e.target.selectionEnd) : '');

            e.target.value = newValue;
        }

        e.preventDefault();
    };
</script>

<div id={rootId} class="number-field-root {thisTheme.root}">
    {#if displayLabel}
        <label id={labelId} for={name} class="number-field-label {thisTheme?.label}">{labelText}</label>
    {/if}
    <div class="number-field-input-container {thisTheme?.inputContainer}">
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
            type="text"
            value={displayValue}
            readonly={isReadOnly}
            disabled={isDisabled}
            autocomplete={autoComplete ?? 'off'}
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
            on:keydown={handleKeyDown}
            on:paste={handlePaste}
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
        <!-- {displayValue} - {$formData.values[name]} -->
    </div>
    {#if errorMessage}
        <p id={errorId} class="number-field-error {thisTheme?.errorMessage}">{errorMessage}</p>
    {/if}
</div>
