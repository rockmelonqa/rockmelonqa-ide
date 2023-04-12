<script lang="ts">
    import type { IDropdownOption } from '../controls/DropdownField';
    import FancyDropdownField from './FancyDropdownField.svelte';
    import NativeDropdownField from './NativeDropdownField.svelte';

    //*****************************************
    // Props
    //*****************************************
    export let name: string;
    export let readonly: boolean = false;
    export let disabled = false;
    export let label = '';
    export let options: IDropdownOption[];
    export let useNative = false;
    export let placeholder = '';
    export let displayLabel = true;
</script>

{#if useNative}
    <NativeDropdownField
        {name}
        {readonly}
        {disabled}
        {label}
        {options}
        {placeholder}
        {displayLabel}
        on:change
        {...$$restProps}
    />
{:else}
    <FancyDropdownField
        {name}
        {readonly}
        {disabled}
        {label}
        {options}
        {placeholder}
        {displayLabel}
        on:change
        {...$$restProps}
    />
{/if}
