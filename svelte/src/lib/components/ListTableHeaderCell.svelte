<script lang="ts">
    import { ListTableCellType } from './ListTable';

    //******************************************
    // Props
    //******************************************
    /** Additoinal CSS class */
    export { cssClass as class };
    let cssClass = '';

    export let type: ListTableCellType = ListTableCellType.Normal;
    export let width = '';

    $: style = width ? `width:${width}` : '';

    //******************************************
    // Init
    //******************************************
    let themeCss = '';
    $: {
        switch (type) {
            case ListTableCellType.Normal:
            case ListTableCellType.Last:
                themeCss = 'py-4 px-3 text-base font-semibold';
                break;
            case ListTableCellType.First:
                themeCss = 'py-4 pl-4 pr-3 text-base font-semibold';
                break;
            case ListTableCellType.LastAction:
                themeCss = 'relative py-3.5 pl-3 pr-4 sm:pr-6';
                break;
        }
    }
</script>

<th scope="col" class="list-table-header-row {themeCss} {cssClass}" {style}>
    <slot />
</th>

<style>
    th.list-table-header-row {
        color: var(--color-secondary--extra-dark);
    }
</style>
