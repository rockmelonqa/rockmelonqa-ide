<script lang="ts">
    let cssClass = 'h-10 w-10';
    export { cssClass as class };

    export let fill = 'none';
    export let color = 'currentColor';
    export let strokeColor = 'currentColor';
    export let strokeWidth = 1;
</script>

<!-- Iconoir/folder -->
<svg
    class={cssClass}
    stroke-width={strokeWidth}
    viewBox="0 0 24 24"
    {fill}
    {color}
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
>
    <path
        d="M2 11V4.6a.6.6 0 01.6-.6h6.178a.6.6 0 01.39.144l3.164 2.712a.6.6 0 00.39.144H21.4a.6.6 0 01.6.6V11M2 11v8.4a.6.6 0 00.6.6h18.8a.6.6 0 00.6-.6V11M2 11h20"
        stroke={strokeColor}
        stroke-width={strokeWidth}
        stroke-linecap="round"
        stroke-linejoin="round"
    />
</svg>
