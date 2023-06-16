<script lang="ts">
    let cssClass = "h-10 w-10";
    export { cssClass as class };

    export let fill = "none";
    export let color = "currentColor";
    export let strokeColor = "currentColor";
    export let strokeWidth = 2;
</script>

<!-- Iconoir/list -->
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
        d="M8 6h12M4 6.01l.01-.011M4 12.01l.01-.011M4 18.01l.01-.011M8 12h12M8 18h12"
        stroke={strokeColor}
        stroke-width={strokeWidth}
        stroke-linecap="round"
        stroke-linejoin="round"
    />
</svg>
