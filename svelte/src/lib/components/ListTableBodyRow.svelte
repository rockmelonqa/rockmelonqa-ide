<script lang="ts">
    //******************************************
    // Props
    //******************************************
    /** Additoinal CSS class */
    export { cssClass as class };
    let cssClass = '';

    export let isOdd = false;
    $: themeCss = isOdd ? 'odd-row' : 'even-row';
</script>

<tr class="list-table-body-row {themeCss} {cssClass}">
    <slot />
</tr>

<style>
    tr.odd-row {
        background-color: var(--color-grey--light);
    }

    tr.list-table-body-row {
        color: var(--color-secondary--extra-dark);
    }
</style>
