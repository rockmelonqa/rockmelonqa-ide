<script lang="ts">
    let cssClass = 'h-10 w-10';
    export { cssClass as class };

    export let fill = 'none';
    export let color = 'currentColor';
    export let strokeColor = 'currentColor';
    export let strokeWidth = 1;
</script>

<!-- Iconoir/refresh-double -->
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
        d="M21.168 8A10.003 10.003 0 0012 2C6.815 2 2.55 5.947 2.05 11"
        stroke={strokeColor}
        stroke-width={strokeWidth}
        stroke-linecap="round"
        stroke-linejoin="round"
    />
    <path
        d="M17 8h4.4a.6.6 0 00.6-.6V3M2.881 16c1.544 3.532 5.068 6 9.168 6 5.186 0 9.45-3.947 9.951-9"
        stroke={strokeColor}
        stroke-width={strokeWidth}
        stroke-linecap="round"
        stroke-linejoin="round"
    />
    <path
        d="M7.05 16h-4.4a.6.6 0 00-.6.6V21"
        stroke={strokeColor}
        stroke-width={strokeWidth}
        stroke-linecap="round"
        stroke-linejoin="round"
    />
</svg>
