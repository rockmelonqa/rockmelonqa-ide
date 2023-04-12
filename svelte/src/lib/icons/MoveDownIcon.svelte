<script lang="ts">
    let cssClass = 'h-10 w-10';
    export { cssClass as class };

    export let fill = 'none';
    export let color = 'currentColor';
    export let strokeColor = 'currentColor';
    export let strokeWidth = 2;
</script>

<!-- Iconoir/arrow-down -->
<svg
    class={cssClass}
    stroke-width={strokeWidth}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    {fill}
    {color}
    aria-hidden="true"
>
    <path
        d="M12.25 5.5V18m0 0l-6-6m6 6l6-6"
        stroke={strokeColor}
        stroke-width={strokeWidth}
        stroke-linecap="round"
        stroke-linejoin="round"
    />
</svg>
