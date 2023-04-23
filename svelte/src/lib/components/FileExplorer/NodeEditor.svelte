<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';
    import FileIcon from '../FileIcon.svelte';
    import { FileType } from '../FileType';
    import { StandardFileExtension } from 'rockmelonqa.common';

    //*****************************************
    // Props
    //*****************************************
    export let value: string = '';
    export let type: FileType;
    export let level: number = 0;

    //*****************************************
    // Init
    //*****************************************
    $: containerClass = 'treeview-item';
    $: rootItemClass = 'treeview-item-root min-w-fit';
    $: rootItemStyle = `padding-left: calc(var(--f7-treeview-item-padding-left) + var(--f7-treeview-children-offset) * ${level})`;

    let inputElement: HTMLInputElement;
    onMount(() => {
        inputElement.focus();
        inputElement.select();
    });

    const dispatch = createEventDispatcher();

    /**
     * Dispatcher from onKeyUp will trigger onBlur (cause a redundant 'submit'),
     * so we need this flag to prevent it
     */
    let dispatched = false;

    const onBlur = () => {
        if (dispatched) {
            dispatched = false;
            return;
        }

        dispatch('submit', { value: enhanceValue(value) });
    };

    const onKeyUp = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            dispatched = true;
            dispatch('submit', { value: enhanceValue(value) });
        } else if (e.key === 'Escape') {
            dispatched = true;
            dispatch('cancel');
        }
    };

    const enhanceValue = (val: string) => {
        if (type === FileType.Page && !val.endsWith(StandardFileExtension.Page)) {
            return val + StandardFileExtension.Page;
        }

        if (type === FileType.TCase && !val.endsWith(StandardFileExtension.TestCase)) {
            return val + StandardFileExtension.TestCase;
        }

        if (type === FileType.TRoutine && !val.endsWith(StandardFileExtension.TestRoutine)) {
            return val + StandardFileExtension.TestRoutine;
        }

        if (type === FileType.TSuite && !val.endsWith(StandardFileExtension.TestSuite)) {
            return val + StandardFileExtension.TestSuite;
        }

        return val;
    }
</script>

<div class={containerClass}>
  <div class={rootItemClass} style={rootItemStyle}>
    <div class="treeview-item-content">
      <FileIcon {type} />
      <input
        type="text"
        bind:this={inputElement}
        bind:value
        class="treeview-item-content-input block w-full text-base px-4 rounded h-8"
        {...$$restProps}
        on:blur={onBlur}
        on:keyup={onKeyUp}
      />
    </div>
  </div>
</div>

<style>
  :global(.treeview-item-content-input) {
    border-color: var(--color-input-border);
  }

  :global(.treeview-item-content-input:focus) {
    border-color: var(--color-input-border--focus);
    --tw-ring-color: var(--color-input-border--focus);
  }
</style>
