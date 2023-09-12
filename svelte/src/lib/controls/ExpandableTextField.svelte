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
    export let readonly: boolean = false;
    export let disabled: boolean = false;
    export let errorMessage: string = "";
    export let focus: boolean = false;
    export let title: string = "";
    export let prefixPadding = "";
    export let suffixPadding = "";
    export let isRightAligned = false;

    export { cssClass as class };
    let cssClass = "";

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

    let inputElement: HTMLTextAreaElement;

    let rootId = `${name}_root`;
    let labelId = `${name}_label`;
    let inputId = `${name}_input`;

    $: inputCssClass =
        `text-field-input block w-full border-0 focus:ring-0 ${thisTheme.inputValid} h-10 ${cssClass}`.trim();

    $: inputStyle = (
        `${prefixPadding ? "padding-left: " + prefixPadding + "; " : " "}` +
        `${suffixPadding ? "padding-right: " + suffixPadding + "; " : " "}` +
        `${isRightAligned ? "text-align: right; " : " "}`
    ).trim();
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
    <div class="text-field-input-container relative isolate {thisTheme?.inputContainer}">
        <input type="text" class="invisible" {name} {value} {placeholder} {readonly} {disabled} />

        <div class="height-holder relative h-fit !bg-green-200 !text-green-800 break-words {inputCssClass}">
            <div class="full-text">
                {value}
            </div>
            <div class="wrapper">
                <textarea
                    bind:this={inputElement}
                    id={inputId}
                    {name}
                    {value}
                    {placeholder}
                    {readonly}
                    {disabled}
                    title={(title || value) ?? value}
                    class="{inputCssClass} border border-gray-300"
                    style={inputStyle}
                    {...$$restProps}
                    on:input={handleInput}
                    on:keyup
                    wrap="soft"
                    rows="1"
                />
            </div>
        </div>

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

<style>
    .text-field-root .height-holder {
        isolation: isolate;
        position: absolute;
        inset: 0;
        width: calc(100% + 8px);
        transform: translateX(-4px);
        box-shadow: 0 0 1px gray;
        padding-top: 0.5rem;
        padding-right: 0.75rem;
        padding-bottom: 0.5rem;
        padding-left: 0.75rem;
        color: red !important;
        height: 100%;
        overflow-y: hidden;
        white-space: nowrap;
        overflow-x: hidden;
        z-index: 10;
    }

    .text-field-root .height-holder:focus-within {
        color: blue !important;
        height: fit-content;
        overflow-y: unset;
        white-space: wrap;
        word-break: break-all;
    }

    .text-field-root .wrapper {
        z-index: 10;
        position: absolute;
        inset: 0;
    }

    .text-field-root textarea {
        white-space: nowrap;
        overflow: hidden;
        resize: none;
    }
    .text-field-root textarea:focus {
        white-space: unset;
        background-color: rgb(96 165 250) !important;
        color: white !important;
        text-overflow: unset;
        height: 100%;
    }
</style>
