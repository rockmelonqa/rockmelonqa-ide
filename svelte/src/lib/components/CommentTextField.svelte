<!--
    Clone from 'controls/TextField.svelte'
-->
<script lang="ts">
    import { uiContextKey, type IUiContext } from "$lib/context/UiContext";
    import type { IUiTheme } from "$lib/context/UiTheme";
    import { createEventDispatcher, getContext, onMount } from "svelte";

    const dispatch = createEventDispatcher();

    //*****************************************
    // Props
    //*****************************************
    export let name: string;
    export let value: string;
    export let placeholder = "";
    export let focus: boolean = false;
    export { cssClass as class };
    let cssClass = "";

    //*****************************************
    // Init
    //*****************************************

    const uiContext = getContext(uiContextKey) as IUiContext;

    let { theme } = uiContext;
    let thisTheme = ($theme as IUiTheme).textField ?? {};

    let inputElement: HTMLInputElement;

    let rootId = `${name}_root`;
    let inputId = `${name}_input`;
    let isFocus = false;

    $: inputCssClass = `text-green-500 text-base px-4  
        border-0 focus:ring-0 focus:border-indigo-500 grow ${cssClass}
        !bg-transparent focus:text-white`.trim();

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
    <div class="text-field-input-container {thisTheme?.inputContainer}">
        <div class="flex">
            <input
                bind:this={inputElement}
                type="text"
                id={inputId}
                {name}
                {value}
                {placeholder}
                class={inputCssClass}
                {...$$restProps}
                on:input={handleInput}
                on:focus={() => (isFocus = true)}
                on:blur={() => (isFocus = false)}
                on:keyup
            />
        </div>
    </div>
</div>

<style>
</style>
