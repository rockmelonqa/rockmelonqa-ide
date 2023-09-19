<script lang="ts">
    let cssClass = "h-5 w-5";
    export { cssClass as class };

    export let fill = "currentColor";
    export let color = "currentColor";
    export let strokeColor = "currentColor";
    export let strokeWidth = 2;
</script>

<!-- Iconoir/chat-lines -->
<svg
    class={cssClass}
    stroke-width={strokeWidth}
    viewBox="0 0 448 512"
    xmlns="http://www.w3.org/2000/svg"
    {fill}
    {color}
    aria-hidden="true"
>
    <path
        d="M8 256a56 56 0 1 1 112 0A56 56 0 1 1 8 256zm160 0a56 56 0 1 1 112 0 56 56 0 1 1 -112 0zm216-56a56 56 0 1 1 0 112 56 56 0 1 1 0-112z"
        stroke={strokeColor}
        stroke-width={strokeWidth}
        stroke-linecap="round"
        stroke-linejoin="round"
    />
</svg>
