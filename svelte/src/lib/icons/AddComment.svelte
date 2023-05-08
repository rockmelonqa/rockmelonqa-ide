<script lang="ts">
    let cssClass = "h-10 w-10";
    export { cssClass as class };

    export let fill = "none";
    export let color = "currentColor";
    export let strokeColor = "currentColor";
    export let strokeWidth = 2;
    export let strokeLinecap: "round" | "inherit" | "butt" | "square" | null | undefined = "round";
    export let strokeLineJoin: "round" | "inherit" | "miter" | "bevel" | null | undefined = "round";
</script>

<!-- Iconoir/chat-add -->
<svg
    class={cssClass}
    width="24px"
    height="24px"
    stroke-width={strokeWidth}
    viewBox="0 0 24 24"
    {fill}
    xmlns="http://www.w3.org/2000/svg"
    {color}
>
    <path
        d="M9 12h3m3 0h-3m0 0V9m0 3v3M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2.5 21.5l4.5-.838A9.955 9.955 0 0012 22z"
        stroke={strokeColor}
        stroke-width={strokeWidth}
        stroke-linecap={strokeLinecap}
        stroke-linejoin={strokeLineJoin}
    />
</svg>
