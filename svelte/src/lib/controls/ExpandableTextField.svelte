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

<div id={rootId} class="text-field-root expandable {thisTheme.root}">
    <div class="text-field-input-container {thisTheme?.inputContainer}">
        <input type="text" class="invisible" />

        <div class="outer-wrapper truncate py-2 px-3 absolute inset-0 focus-within:h-fit focus-within:overflow-y-auto">
            <div class="invisible">
                {#if value}
                    {value}
                {:else}
                    {@html "&nbsp;"}
                {/if}
            </div>
            <div class="absolute inset-0">
                <textarea
                    bind:this={inputElement}
                    id={inputId}
                    {name}
                    {value}
                    {placeholder}
                    {readonly}
                    {disabled}
                    title={(title || value) ?? value}
                    class="{inputCssClass} !h-full resize-none
                        whitespace-nowrap overflow-hidden focus:whitespace-normal focus:overflow-auto"
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
    }
</style>
