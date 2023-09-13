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
    export let placeholder = "";
    export let readonly: boolean = false;
    export let disabled: boolean = false;
    export let errorMessage: string = "";
    export let focus: boolean = false;
    export let title: string = "";

    export { cssClass as class };
    let cssClass = "";

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
    let inputId = `${name}_input`;

    $: inputCssClass =
        `text-field-input block w-full border-0 focus:ring-0 ${thisTheme.inputValid} h-10 ${cssClass}`.trim();

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
    <div class="text-field-input-container w-full relative isolate {thisTheme?.inputContainer}">
        <input type="text" class="invisible w-full border-0" {name} {value} {placeholder} {readonly} {disabled} />

        <div
            class="outer-wrapper whitespace-nowrap py-2 px-3 absolute inset-0 isolate h-fit break-words overflow-hidden focus-within:shadow-md focus-within:shadow-blue-200 focus-within:break-all focus-within:overflow-y-auto {inputCssClass}"
        >
            <div class="full-text">
                {#if value}
                    {value}
                {:else}
                    {@html "&nbsp;"}
                {/if}
            </div>
            <div class="absolute inset-0 h-full">
                <textarea
                    bind:this={inputElement}
                    id={inputId}
                    {name}
                    {value}
                    {placeholder}
                    {readonly}
                    {disabled}
                    title={(title || value) ?? value}
                    class="{inputCssClass} border border-gray-300 h-full whitespace-nowrap overflow-hidden resize-none focus:whitespace-normal focus:text-white focus:overflow-auto"
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
    .outer-wrapper {
        width: calc(100% + 8px);
        transform: translateX(-4px);
    }

    .outer-wrapper:focus-within {
        white-space: wrap;
        box-shadow: 0px 0px 2px 2px lightblue;
    }

    textarea:focus {
        background-color: rgb(96 165 250) !important;
    }
</style>
