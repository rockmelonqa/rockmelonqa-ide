<script lang="ts">
    //***************************************
    // Props
    //***************************************
    let cssClass = '';
    export { cssClass as class };
</script>

<div class="grid grid-cols-1 gap-y-2 justify-start content-start {cssClass}">
    <slot />
</div>
