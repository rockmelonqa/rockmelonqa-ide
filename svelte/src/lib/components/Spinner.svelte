<script lang="ts">
    import { Shadow } from 'svelte-loading-spinners';
    import { SpinnerSize } from './Spinner';

    //******************************************
    // Props
    //******************************************
    /** Size of spinner.  Big for wait on page loading.  Small for wait on ajax.*/
    export let size: SpinnerSize = SpinnerSize.Small;

    /** Text to show to the right of the spinner */
    export let textRight: string = '';

    /** Text to show to the bottom of the spinner */
    export let textBottom: string = '';

    /** Additional CSS class */
    export { cssClass as class };
    let cssClass = '';

    /** True to show, false to hide*/
    export let show = true;

    //******************************************
    // Init
    //******************************************
    $: fontSize = size === SpinnerSize.Big ? 24 : 14;
    $: textSize = size === SpinnerSize.Big ? 'text-xl' : 'text-base';
    $: paddingLeft = size === SpinnerSize.Big ? 'pl-4' : 'pl-2';
    $: paddingRight = size === SpinnerSize.Big ? 'pr-6' : 'pr-3';
    $: marginBottom = size === SpinnerSize.Big ? 'mb-8' : 'mb-6';
</script>

{#if show}
    {#if textBottom}
        <div class="{cssClass} flex flex-col justify-center items-center">
            <div class={marginBottom} style="font-size: 100%;">
                <Shadow size={fontSize} color="var(--color-brand)" />
            </div>
            <div class="{textSize} font-semibold" style="color: var(--color-brand);">
                {textBottom}
            </div>
        </div>
    {:else if textRight}
        <div class={cssClass}>
            <div class="{paddingLeft} {paddingRight} inline-block">
                <Shadow size={fontSize} unit="px" color="var(--color-brand)" />
            </div>
            <div class="{textSize} font-semibold inline-block" style="color: var(--color-brand);">
                {textRight}
            </div>
        </div>
    {/if}
{/if}
