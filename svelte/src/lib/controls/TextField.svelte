<script lang="ts">
    import { uiContextKey, type IUiContext } from "$lib/context/UiContext";
    import type { ITextFieldTheme, IUiTheme } from "$lib/context/UiTheme";
    import { createEventDispatcher, getContext, onMount } from "svelte";

    const dispatch = createEventDispatcher();

    //*****************************************
    // Props
    //*****************************************
    export let name: string;
    export let value: string;
    export let label = "";
    export let placeholder = "";
    export let type = "text";
    export let readonly: boolean = false;
    export let disabled: boolean = false;
    export let errorMessage: string = '';
    export let focus: boolean = false;

    $: displayLabel = label.length > 0;

    let desiredTheme: ITextFieldTheme | undefined = undefined;
    export { desiredTheme as theme };

    //*****************************************
    // Init
    //*****************************************

    const uiContext = getContext(uiContextKey) as IUiContext;

    let { theme } = uiContext;
    const defaultTheme = ($theme as IUiTheme).inlineTextField ?? {};
    const thisTheme = desiredTheme ?? defaultTheme;

    let inputElement: HTMLInputElement;

    let rootId = `${name}_root`;
    let labelId = `${name}_label`;
    let inputId = `${name}_input`;

    $: inputCssClass = `${thisTheme?.input} ${thisTheme.inputValid} h-10 focus-visible:outline-0`.trim();
    //*****************************************
    // Events
    //*****************************************
    onMount(() => {
        if (focus) {
            inputElement.focus();
            inputElement.select();
        }
    });

    const handleInput = (e: any) => {
        const value = inputElement.value;
        dispatch("input", { value });
    };
</script>

<div id={rootId} class="text-field-root {thisTheme.root}">
    {#if displayLabel}
        <label id={labelId} for={name} class="text-field-label {thisTheme?.label}">{label}</label>
    {/if}
    <div class="text-field-input-container {thisTheme?.inputContainer}">
        {#if $$slots.prefix}
            <div class={thisTheme?.prefixContainer}>
                <slot name="prefix" />
            </div>
        {/if}
        <input
            bind:this={inputElement}
            id={inputId}
            {type}
            {name}
            {value}
            {placeholder}
            {readonly}
            {disabled}
            class={inputCssClass}
            {...$$restProps}
            on:input={handleInput}
            on:keyup
        />
        {#if $$slots.suffix}
            <div class={thisTheme?.suffixContainer}>
                <slot name="suffix" />
            </div>
        {/if}
    </div>
    {#if errorMessage}
        <p id={`${inputId}-error`} class="text-field-error absolute {thisTheme?.errorMessage}">{errorMessage}</p>
    {/if}
</div>
