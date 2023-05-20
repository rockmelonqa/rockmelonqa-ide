<!--
    Clone from 'controls/TextField.svelte'
-->
<script lang="ts">
    import { uiContextKey, type IUiContext } from '$lib/context/UiContext';
    import type { IUiTheme } from '$lib/context/UiTheme';
    import { createEventDispatcher, getContext } from 'svelte';

    const dispatch = createEventDispatcher();

    //*****************************************
    // Props
    //*****************************************
    export let name: string;
    export let value: string;
    export let placeholder = '';
    export let autoFocus: boolean = false;

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

    $: inputCssClass = `text-field-input !text-green-500 text-base px-4  
        rounded-md border-l-0 rounded-l-none border-slate-300 focus:ring-0 focus:border-indigo-500 grow`.trim();
    //*****************************************
    // Events
    //*****************************************
    const handleInput = (e: any) => {
        const value = inputElement.value;
        dispatch('input', { value });
    };

    /**
     * On init CommentTextField
     * @param el Input Element
     */
    const onInit= (el: any) => {
        if(autoFocus) {
            el.focus();
        }
    }
</script>

<div id={rootId} class="text-field-root {thisTheme.root}">
    <div class="text-field-input-container {thisTheme?.inputContainer}">
        <div class="flex">
            <button
                type="button"
                class={`bg-slate-100 cursor-default px-6 py-3 
                    border ${isFocus ? 'border-indigo-500' : 'border-slate-300'} font-bold rounded-l-md shadow-sm`}
                {...$$restProps}
            >
                <span>Comment</span>
            </button>

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
                use:onInit
            />
        </div>
    </div>
</div>

<style>
</style>
