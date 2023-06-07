<script lang="ts">
    import { AlertDialogButtons, AlertDialogType } from '$lib/components/Alert';
    import AlertDialog from '$lib/components/AlertDialog.svelte';
    import IconLinkButton from '$lib/components/IconLinkButton.svelte';
    import { ListTableCellType } from '$lib/components/ListTable';
    import ListTable from '$lib/components/ListTable.svelte';
    import ListTableBodyCell from '$lib/components/ListTableBodyCell.svelte';
    import ListTableBodyRow from '$lib/components/ListTableBodyRow.svelte';
    import ListTableHeaderCell from '$lib/components/ListTableHeaderCell.svelte';
    import PrimaryButton from '$lib/components/PrimaryButton.svelte';
    import { stringResKeys } from '$lib/context/StringResKeys';
    import { uiContextKey, type IUiContext } from '$lib/context/UiContext';
    import TextField from '$lib/controls/TextField.svelte';
    import type { IDictionary } from '$lib/form/FieldDef';
    import type { IFormContext } from '$lib/form/FormContext';
    import { ListDataActionType, type IListDataContext } from '$lib/form/ListData';
    import AddIcon from '$lib/icons/AddIcon.svelte';
    import DeleteIcon from '$lib/icons/DeleteIcon.svelte';
    import MoveDownIcon from '$lib/icons/MoveDownIcon.svelte';
    import MoveUpIcon from '$lib/icons/MoveUpIcon.svelte';
    import SaveIcon from '$lib/icons/SaveIcon.svelte';
    import type { IDataSet } from 'rockmelonqa.common';
    import { createEventDispatcher, getContext } from 'svelte';
    import { v4 as uuidv4 } from 'uuid';

    export let formContext: IFormContext;
    let { mode: formMode, formName } = formContext;

    export let listDataSetContext: IListDataContext;
    let { value: listDataSet, dispatch: listDataSetDispatch } = listDataSetContext;

    const uiContext = getContext(uiContextKey) as IUiContext;

    const dispatch = createEventDispatcher();

    let deleteDialogType: AlertDialogType = AlertDialogType.None;
    let indexToDelete: number;

    const handleItemChange = (index: number, key: string, value: any) => {
        const item = { ...$listDataSet.items[index] };
        item[key] = value;

        listDataSetDispatch({
            type: ListDataActionType.UpdateItem,
            index,
            item,
        });

        dispatchChange(false);
    };

    const handleDeleteClick = (index: number) => {
        // Determine if this row has any input.
        // If yes, show confirmation dialog. Otherwise, delete straight away
        if (isEmptyItem($listDataSet.items[index])) {
            doDeleteRow(index);
        } else {
            deleteDialogType = AlertDialogType.Question;
            indexToDelete = index;
        }
    };

    const isEmptyItem = (item: IDictionary) => {
        const ignoredProperties: string[] = ['id'];
        return Object.entries(item)
            .filter(([key, value]) => !ignoredProperties.includes(key))
            .map(([key, value]) => value)
            .every((x) => !x);
    };

    const handleDeleteConfirmation = async (event: any) => {
        if (event.detail.button === 'delete') {
            doDeleteRow(indexToDelete);
        }
    };

    const doDeleteRow = (index: number) => {
        listDataSetDispatch({
            type: ListDataActionType.RemoveItem,
            index: index,
        });
        dispatchChange(true);
    };

    const handleMoveDownClick = (index: number) => {
        if (index >= 0 && index <= $listDataSet.items.length - 2) {
            listDataSetDispatch({
                type: ListDataActionType.SwapItems,
                indexA: index,
                indexB: index + 1,
            });

            dispatchChange(true);
        }
    };

    const handleMoveUpClick = (index: number) => {
        if (index >= 1 && index <= $listDataSet.items.length - 1) {
            listDataSetDispatch({
                type: ListDataActionType.SwapItems,
                indexA: index,
                indexB: index - 1,
            });

            dispatchChange(true);
        }
    };

    const handleAdd = () => {
        listDataSetDispatch({
            type: ListDataActionType.AppendItems,
            items: [newItem()],
            hasMoreItems: false,
        });

        dispatchChange(true);
    };
    const handleInsert = (index: number) => {
        listDataSetDispatch({
            type: ListDataActionType.InsertItem,
            item: newItem(),
            index: index + 1,
        });

        dispatchChange(true);
    };
    const newItem = () => {
        return {
            id: uuidv4(),
            name: '',
            description: '',
        } as IDataSet;
    };

    /**
     * Dispatch change to parent component
     * @param changeScheme: True if add, delete or update the order
     */
    const dispatchChange = (changeScheme: boolean) => {
        dispatch('change', { changeScheme });
    };
</script>

<ListTable class="table-fixed mb-4" isProcessing={$formMode.isLoading() || $formMode.isProcessing()} isEmpty={false}>
    <svelte:fragment slot="header">
        <ListTableHeaderCell type={ListTableCellType.First} class="text-left w-4/12">
            {uiContext.str(stringResKeys.testRoutineEditor.name)}
        </ListTableHeaderCell>
        <ListTableHeaderCell type={ListTableCellType.Normal} class="text-left w-7/12">
            {uiContext.str(stringResKeys.testRoutineEditor.description)}
        </ListTableHeaderCell>
        <ListTableHeaderCell type={ListTableCellType.LastAction} class="text-center w-1/12">
            {uiContext.str(stringResKeys.testRoutineEditor.actions)}
        </ListTableHeaderCell>
    </svelte:fragment>
    <svelte:fragment slot="body">
        {#each $listDataSet.items as item, index}
            <ListTableBodyRow>
                <ListTableBodyCell type={ListTableCellType.First}>
                    <TextField
                        name={`${formName}_${index}_name`}
                        value={item.name}
                        on:input={(event) => {
                            handleItemChange(index, 'name', event.detail.value);
                        }}
                    />
                </ListTableBodyCell>
                <ListTableBodyCell type={ListTableCellType.Last}>
                    <TextField
                        name={`${formName}_${index}_description`}
                        value={item.description}
                        on:input={(event) => handleItemChange(index, 'description', event.detail.value)}
                    />
                </ListTableBodyCell>
                <ListTableBodyCell type={ListTableCellType.LastAction} class="align-bottom whitespace-nowrap">
                    <IconLinkButton
                        on:click={() => handleInsert(index)}
                        title={uiContext.str(stringResKeys.general.add)}
                    >
                        <svelte:fragment slot="icon"><AddIcon /></svelte:fragment>
                    </IconLinkButton>
                    <IconLinkButton
                        on:click={() => handleDeleteClick(index)}
                        title={uiContext.str(stringResKeys.general.delete)}
                    >
                        <svelte:fragment slot="icon"><DeleteIcon /></svelte:fragment>
                    </IconLinkButton>
                    {#if index > 0}
                        <IconLinkButton
                            on:click={() => handleMoveUpClick(index)}
                            title={uiContext.str(stringResKeys.general.moveUp)}
                        >
                            <svelte:fragment slot="icon"><MoveUpIcon /></svelte:fragment>
                        </IconLinkButton>
                    {/if}
                    {#if index < $listDataSet.items.length - 1}
                        <IconLinkButton
                            on:click={() => handleMoveDownClick(index)}
                            title={uiContext.str(stringResKeys.general.moveDown)}
                        >
                            <svelte:fragment slot="icon"><MoveDownIcon /></svelte:fragment>
                        </IconLinkButton>
                    {/if}
                </ListTableBodyCell>
            </ListTableBodyRow>
        {/each}
    </svelte:fragment>
</ListTable>

<div class="mb-8 flex items-center gap-x-2">
    <IconLinkButton on:click={handleAdd}>
        <svelte:fragment slot="icon"><AddIcon /></svelte:fragment>
        <svelte:fragment slot="label">
            {uiContext.str(stringResKeys.general.add)}
        </svelte:fragment>
    </IconLinkButton>

    <div class="ml-auto">
        <PrimaryButton on:click={() => dispatch('save')}>
            <span class="flex items-center gap-x-2">
                <SaveIcon class="w-5 h-5" />
                {uiContext.str(stringResKeys.general.save)}
            </span>
        </PrimaryButton>
    </div>
</div>

<AlertDialog
    id="dialogDeleteRow"
    bind:type={deleteDialogType}
    buttons={AlertDialogButtons.DeleteCancel}
    on:click={handleDeleteConfirmation}
>
    <div slot="title">{uiContext.str(stringResKeys.general.confirmation)}</div>
    <div slot="content">{uiContext.str(stringResKeys.testRoutineEditor.deleteRowConfirmation)}</div>
</AlertDialog>
