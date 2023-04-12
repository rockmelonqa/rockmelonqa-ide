<script lang="ts">
    let cssClass = 'h-10 w-10';
    export { cssClass as class };

    export let fill = 'none';
    export let color = 'currentColor';
    export let boundaryColor = 'currentColor';
    export let questionMarkColor = 'currentColor';
    export let strokeWidth = 2;
</script>

<!-- Iconoir/help-circle -->
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
        d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
        stroke={boundaryColor}
        stroke-width={strokeWidth}
        stroke-linecap="round"
        stroke-linejoin="round"
    />
    <path
        d="M9 9c0-3.5 5.5-3.5 5.5 0 0 2.5-2.5 2-2.5 5M12 18.01l.01-.011"
        stroke={questionMarkColor}
        stroke-width={strokeWidth}
        stroke-linecap="round"
        stroke-linejoin="round"
    />
</svg>
