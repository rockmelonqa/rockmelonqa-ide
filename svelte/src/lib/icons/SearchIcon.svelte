<script lang="ts">
    let cssClass = 'h-10 w-10';
    export { cssClass as class };

    export let fill = 'none';
    export let color = 'currentColor';
    export let strokeColor = 'currentColor';
    export let strokeWidth = 1;
</script>

<!-- Iconoir/search -->
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
        d="M15.5 15.5L19 19M5 11a6 6 0 1012 0 6 6 0 00-12 0z"
        stroke={strokeColor}
        stroke-width={strokeWidth}
        stroke-linecap="round"
        stroke-linejoin="round"
    />
</svg>
