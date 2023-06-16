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
    import { appContextKey, type IAppContext } from '$lib/context/AppContext';
    import { stringResKeys } from '$lib/context/StringResKeys';
    import { uiContextKey, type IUiContext } from '$lib/context/UiContext';
    import type { IDropdownOption } from '$lib/controls/DropdownField';
    import FancyDropdownField from '$lib/controls/FancyDropdownField.svelte';
    import TextField from '$lib/controls/TextField.svelte';
    import type { IDictionary } from '$lib/form/FieldDef';
    import type { IFormContext } from '$lib/form/FormContext';
    import { ListDataActionType, type IListDataContext } from '$lib/form/ListData';
    import AddIcon from '$lib/icons/AddIcon.svelte';
    import CommentIcon from '$lib/icons/CommentIcon.svelte';
    import DeleteIcon from '$lib/icons/DeleteIcon.svelte';
    import MoveDownIcon from '$lib/icons/MoveDownIcon.svelte';
    import MoveUpIcon from '$lib/icons/MoveUpIcon.svelte';
    import SaveIcon from '$lib/icons/SaveIcon.svelte';
    import { getActionTypeDropDownOptions } from '$lib/utils/dropdowns';
    import type { ITestRoutineStep as ITestStep } from 'rockmelonqa.common';
    import { createEventDispatcher, getContext } from 'svelte';
    import { derived } from 'svelte/store';
    import { v4 as uuidv4 } from 'uuid';
    import { isPagelessAction } from '../Editor';
    import CommentTextField from '$lib/components/CommentTextField.svelte';
    import { removeFileExtension } from '$lib/utils/utils';

    export let formContext: IFormContext;
    let { mode: formMode, formName } = formContext;

    const uiContext = getContext(uiContextKey) as IUiContext;

    let appContext = getContext(appContextKey) as IAppContext;
    let { state: appState, dispatch: appStateDispatch } = appContext;

    export let listStepContext: IListDataContext;
    let { value: listStep, dispatch: listStepDispatch } = listStepContext;

    export let dataSetItems: IDictionary[];

    let actionTypeOptions: IDropdownOption[] = getActionTypeDropDownOptions(uiContext);
    let deleteDialogType: AlertDialogType = AlertDialogType.None;
    let indexToDelete: number;

    let pageDefinitionOptions: IDropdownOption[] = [];
    // Key: page id.  Value: page element options
    let pageElementsMap: Map<string, IDropdownOption[]>;
    const pagesSubscription = derived(appState, ($appState) => $appState.pages);
    pagesSubscription.subscribe((pages) => {
        pageDefinitionOptions = Array.from(pages.entries())
            .map(([key, { name }]) => ({ key, text: removeFileExtension(name) } as IDropdownOption))
            .sort((a, b) => a.text.localeCompare(b.text));

        pageElementsMap = new Map();
        for (const [pageId, pageData] of pages) {
            // only get completed row
            const elements = Array.from(pageData.elements.values())
                .filter((e) => e.id && e.name != null && e.findBy != null && e.locator != null);

            const dropdownOptions: IDropdownOption[] = [];
            for (const element of elements) {
                dropdownOptions.push({
                    key: element.id,
                    text: element.name!,
                });
            }
            dropdownOptions.sort((a, b) => a.text.localeCompare(b.text));
            pageElementsMap.set(pageId, dropdownOptions);
        }
    });

    const isTestStep = (item: IDictionary) => {
        return (item as ITestStep).type === "testStep";
    };

    let lastUsedPage: string | undefined = $listStep.items.findLast(item => isTestStep(item) && !isPagelessAction(item.action))?.page;

    const dispatch = createEventDispatcher();

    const handleItemChange = (index: number, key: string, value: any) => {
        const item = { ...$listStep.items[index] };
        item[key] = value;

        listStepDispatch({
            type: ListDataActionType.UpdateItem,
            index,
            item,
        });

        dispatchChange();
    };
    const handlePageChange = (index: number, value: any) => {
        lastUsedPage = value;
        handleItemChange(index, "page", value);
    };

    const handleStepDataItemChange = (index: number, dataIndex: number, value: any) => {
        const item = { ...$listStep.items[index] };
        item['data'][dataIndex]['value'] = value;

        listStepDispatch({
            type: ListDataActionType.UpdateItem,
            index,
            item,
        });

        dispatchChange();
    };

    const handleDeleteClick = (index: number) => {
        // Determine if this row has any input.
        // If yes, show confirmation dialog. Otherwise, delete straight away
        if (isEmptyItem($listStep.items[index])) {
            doDeleteRow(index);
        } else {
            deleteDialogType = AlertDialogType.Question;
            indexToDelete = index;
        }
    };

    const isEmptyItem = (item: IDictionary) => {
        const ignoredProperties: string[] = ['id', 'type'];
        return !Object.entries(item)
            .filter(([key, value]) => !ignoredProperties.includes(key))
            .some(([key, value]) => (key === 'data' ? value.some((x: any) => x.value) : value));
    };

    const handleDeleteConfirmation = async (event: any) => {
        if (event.detail.button === 'delete') {
            doDeleteRow(indexToDelete);
        }
    };

    const doDeleteRow = (index: number) => {
        listStepDispatch({
            type: ListDataActionType.RemoveItem,
            index: index,
        });

        dispatchChange();
    };

    const handleMoveUpClick = (index: number) => {
        if (index >= 1 && index <= $listStep.items.length - 1) {
            listStepDispatch({
                type: ListDataActionType.SwapItems,
                indexA: index,
                indexB: index - 1,
            });

            dispatchChange();
        }
    };

    const handleMoveDownClick = (index: number) => {
        if (index >= 0 && index <= $listStep.items.length - 2) {
            listStepDispatch({
                type: ListDataActionType.SwapItems,
                indexA: index,
                indexB: index + 1,
            });

            dispatchChange();
        }
    };

    const handleAddStep = () => {
        listStepDispatch({
            type: ListDataActionType.AppendItems,
            items: [newStep()],
            hasMoreItems: false,
        });

        dispatchChange();
    };
    const handleInsertStep = (index: number) => {
        listStepDispatch({
            type: ListDataActionType.InsertItem,
            item: newStep(),
            index: index + 1,
        });

        dispatchChange();
    };
    const newStep = () => {
        return {
            id: uuidv4(),
            type: 'testStep',
            name: '',
            description: '',
            page: lastUsedPage,
            data: dataSetItems.map((x) => ({
                id: x.id,
                value: '',
            })),
        } as IDictionary;
    };

    const handleAddComment = () => {
        listStepDispatch({
            type: ListDataActionType.AppendItems,
            items: [newComment()],
            hasMoreItems: false,
        });

        dispatchChange();
    };
    const handleInsertComment = (index: number) => {
        listStepDispatch({
            type: ListDataActionType.InsertItem,
            item: newComment(),
            index: index + 1,
        });

        dispatchChange();
    };
    const newComment = () => {
        return { id: uuidv4(), type: 'comment', comment: '' } as IDictionary;
    };

    const isComment = (item: IDictionary) => {
        return (item as ITestStep).type === 'comment';
    };

    const dispatchChange = () => {
        dispatch('change');
    };
</script>

<ListTable class="table-fixed mb-4" isProcessing={$formMode.isLoading() || $formMode.isProcessing()} isEmpty={false}>
    <svelte:fragment slot="header">
        <ListTableHeaderCell type={ListTableCellType.First} class="text-left w-48">
            {uiContext.str(stringResKeys.testRoutineEditor.action)}
        </ListTableHeaderCell>
        <ListTableHeaderCell type={ListTableCellType.Normal} class="text-left w-48">
            {uiContext.str(stringResKeys.testRoutineEditor.page)}
        </ListTableHeaderCell>
        <ListTableHeaderCell type={ListTableCellType.Normal} class="text-left w-48">
            {uiContext.str(stringResKeys.testRoutineEditor.element)}
        </ListTableHeaderCell>
        {#if dataSetItems.length > 0}
            {#each dataSetItems as item, index}
                <ListTableHeaderCell
                    type={index < dataSetItems.length - 1 ? ListTableCellType.Normal : ListTableCellType.Last}
                    class="text-left w-48"
                >
                    {item.name}
                </ListTableHeaderCell>
            {/each}
        {/if}

        <ListTableHeaderCell type={ListTableCellType.LastAction} class="text-center w-36">
            {uiContext.str(stringResKeys.testRoutineEditor.actions)}
        </ListTableHeaderCell>
    </svelte:fragment>
    <svelte:fragment slot="body">
        {#each $listStep.items as item, index}
            <ListTableBodyRow>
                {#if isComment(item)}
                    <ListTableBodyCell type={ListTableCellType.First} colspan={3 + dataSetItems.length}>
                        <CommentTextField
                            name={`${formName}_${index}_comment`}
                            value={item.comment}
                            placeholder={uiContext.str(stringResKeys.testRoutineEditor.comment)}
                            on:input={(event) => handleItemChange(index, 'comment', event.detail.value)}
                        />
                    </ListTableBodyCell>
                {:else}
                    <ListTableBodyCell type={ListTableCellType.First}>
                        <FancyDropdownField
                            name={`${formName}_${index}_action`}
                            value={item.action}
                            options={actionTypeOptions}
                            on:change={(event) => handleItemChange(index, 'action', event.detail.value)}
                        />
                    </ListTableBodyCell>
                    <ListTableBodyCell type={ListTableCellType.Normal}>
                        {#if !isPagelessAction(item.action)}
                            <FancyDropdownField
                                name={`${formName}_${index}_page`}
                                value={item.page}
                                options={pageDefinitionOptions}
                                on:change={(event) => handlePageChange(index, event.detail.value)}
                            />
                        {/if}
                    </ListTableBodyCell>
                    <ListTableBodyCell type={ListTableCellType.Normal}>
                        {#if !isPagelessAction(item.action)}
                            <FancyDropdownField
                                name={`${formName}_${index}_element`}
                                value={item.element}
                                options={pageElementsMap.get(item.page) ?? []}
                                on:change={(event) => handleItemChange(index, 'element', event.detail.value)}
                            />
                        {/if}
                    </ListTableBodyCell>
                    {#if item.data.length > 0}
                        {#each item.data as data, dataIndex}
                            <ListTableBodyCell
                                type={dataIndex < item.data.length - 1
                                    ? ListTableCellType.Normal
                                    : ListTableCellType.Last}
                            >
                                <TextField
                                    name={`${formName}_${index}_data_${dataIndex}`}
                                    value={data.value}
                                    on:input={(event) => handleStepDataItemChange(index, dataIndex, event.detail.value)}
                                />
                            </ListTableBodyCell>
                        {/each}
                    {/if}
                {/if}
                <ListTableBodyCell type={ListTableCellType.LastAction} class="align-bottom whitespace-nowrap">
                    <IconLinkButton
                        on:click={() => handleInsertStep(index)}
                        title={uiContext.str(stringResKeys.testCaseEditor.addStep)}
                    >
                        <svelte:fragment slot="icon"><AddIcon /></svelte:fragment>
                    </IconLinkButton>
                    <IconLinkButton
                        on:click={() => handleInsertComment(index)}
                        title={uiContext.str(stringResKeys.testCaseEditor.addComment)}
                    >
                        <svelte:fragment slot="icon"><CommentIcon /></svelte:fragment>
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
                    {#if index < $listStep.items.length - 1}
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
    <IconLinkButton on:click={handleAddStep}>
        <svelte:fragment slot="icon"><AddIcon /></svelte:fragment>
        <svelte:fragment slot="label">
            {uiContext.str(stringResKeys.general.add)}
        </svelte:fragment>
    </IconLinkButton>
    <span>|</span>
    <IconLinkButton on:click={handleAddComment}>
        <svelte:fragment slot="icon"><CommentIcon /></svelte:fragment>
        <svelte:fragment slot="label">
            {uiContext.str(stringResKeys.testRoutineEditor.addComment)}
        </svelte:fragment>
    </IconLinkButton>

    <div class="ml-auto absolute right-5">
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