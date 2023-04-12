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
    export let colspan = 1;

    let themeCss = '';
    $: {
        switch (type) {
            case ListTableCellType.Normal:
            case ListTableCellType.Last:
                themeCss = 'py-4 px-3 text-base';
                break;
            case ListTableCellType.First:
                themeCss = 'py-4 pl-4 pr-3 text-base';
                break;
            case ListTableCellType.LastAction:
                themeCss = 'relative py-4 pl-3 pr-4 text-base font-medium sm:pr-6';
                break;
        }
    }
</script>

<td class="{themeCss} {cssClass} {width}" {colspan}>
    <slot />
</td>
