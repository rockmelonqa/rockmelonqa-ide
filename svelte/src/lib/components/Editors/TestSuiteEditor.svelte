<script lang="ts">
    import { appContextKey, type IAppContext } from '$lib/context/AppContext';
    import { stringResKeys } from '$lib/context/StringResKeys';
    import { uiContextKey, type IUiContext } from '$lib/context/UiContext';
    import type { IUiTheme } from '$lib/context/UiTheme';
    import type { IDropdownOption } from '$lib/controls/DropdownField';
    import FancyDropdownField from '$lib/controls/FancyDropdownField.svelte';
    import FormGroup from '$lib/controls/layout/FormGroup.svelte';
    import FormGroupColumn from '$lib/controls/layout/FormGroupColumn.svelte';
    import Form from '$lib/form-controls/Form.svelte';
    import FormTextField from '$lib/form-controls/TextField.svelte';
    import { FieldDataType, type IDictionary } from '$lib/form/FieldDef';
    import { createFormContext } from '$lib/form/FormContext';
    import { FormDataActionType } from '$lib/form/FormData';
    import type { IFormDef } from '$lib/form/FormDef';
    import { FormModeState } from '$lib/form/FormMode';
    import { FormSerializer } from '$lib/form/FormSerializer';
    import { createListDataContext, ListDataActionType } from '$lib/form/ListData';
    import type { IListDef } from '$lib/form/ListDef';
    import AddIcon from '$lib/icons/AddIcon.svelte';
    import DeleteIcon from '$lib/icons/DeleteIcon.svelte';
    import MoveDownIcon from '$lib/icons/MoveDownIcon.svelte';
    import MoveUpIcon from '$lib/icons/MoveUpIcon.svelte';
    import SaveIcon from '$lib/icons/SaveIcon.svelte';
    import { fileSystem } from '$lib/ipc';
    import { fileDefFactory, type ITestSuite } from 'rockmelonqa.common';
    import { createEventDispatcher, getContext, onMount } from 'svelte';
    import { derived } from 'svelte/store';
    import { AlertDialogButtons, AlertDialogType } from '../Alert';
    import AlertDialog from '../AlertDialog.svelte';
    import { appActionContextKey, type IAppActionContext } from '../Application';
    import { combinePath } from '../FileExplorer/Node';
    import IconLinkButton from '../IconLinkButton.svelte';
    import { ListTableCellType } from '../ListTable';
    import ListTable from '../ListTable.svelte';
    import ListTableBodyCell from '../ListTableBodyCell.svelte';
    import ListTableBodyRow from '../ListTableBodyRow.svelte';
    import ListTableHeaderCell from '../ListTableHeaderCell.svelte';
    import PrimaryButton from '../PrimaryButton.svelte';
    import { toTitle } from './Editor';

    const uiContext = getContext(uiContextKey) as IUiContext;
    const { theme } = uiContext;
    const uiTheme = $theme as IUiTheme;

    export let folderPath: string;
    export let fileName: string;
    $: filePath = combinePath([folderPath, fileName], uiContext.pathSeparator);

    export let contentIndex: number;

    let appContext = getContext(appContextKey) as IAppContext;
    let { state: appState, dispatch: appStateDispatch } = appContext;

    const formDef: IFormDef = {
        fields: {
            id: {
                dataType: FieldDataType.Text,
                dataPath: 'id',
                isRequired: true,
            },
            description: {
                dataType: FieldDataType.Text,
                dataPath: 'description',
            },
        },
    };
    let formContext = createFormContext('testSuiteEditor', formDef, uiContext, FormModeState.Edit);
    let {
        mode: formMode,
        modeDispatch: formModeDispatch,
        data: formData,
        dataDispatch: formDataDispatch,
    } = formContext;

    const listDef: IListDef = {
        fields: {
            id: {
                dataType: FieldDataType.Dropdown,
                dataPath: 'id',
            },
        },
    };
    let listDataContext = createListDataContext(listDef, uiContext);
    let { value: listData, dispatch: listDataDispatch } = listDataContext;

    $: title = toTitle(fileName);
    let deleteDialogType: AlertDialogType = AlertDialogType.None;
    let indexToDelete: number;

    let testCaseOptions: IDropdownOption[] = [];

    const { registerOnSaveHandler, unregisterOnSaveHandler } = getContext(appActionContextKey) as IAppActionContext;
    const dispatch = createEventDispatcher();

    const testCasesSubscription = derived(appState, ($appState) => $appState.testCases);
    testCasesSubscription.subscribe((testCase) => {
        testCaseOptions = Array.from(testCase.entries())
            .map(([key, { name }]) => ({ key, text: name } as IDropdownOption))
            .sort((a, b) => a.text.localeCompare(b.text));
    });

    onMount(async () => {
        // default/empty data
        let model: ITestSuite = fileDefFactory.newTestSuite();

        // parse file content if any
        const fileContent = await fileSystem.readFile(filePath);
        if (fileContent) {
            model = JSON.parse(fileContent) as ITestSuite;
        }

        const serializer = new FormSerializer(uiContext);
        const fieldValues = serializer.deserialize(model, formDef.fields);
        formDataDispatch({ type: FormDataActionType.Load, newValues: fieldValues });

        const items = serializer.deserializeList(
            model.testcases.map((t) => ({
                id: t,
            })),
            listDef.fields
        );
        listDataDispatch({ type: ListDataActionType.SetItems, items: items, hasMoreItems: false });

        registerOnSaveHandler(contentIndex, doSave);

        return () => {
            unregisterOnSaveHandler(contentIndex);
        };
    });

    const handleSave = async () => {
        await doSave();
    };

    const doSave = async (): Promise<boolean> => {
        if ($formData.isValid) {
            const serializer = new FormSerializer(uiContext);
            const model = serializer.serialize($formData.values, formDef.fields);

            const items = $listData.items.filter((r) => !isEmptyItem(r));
            const testCases = serializer.serializeList(items, listDef.fields);
            const data = { ...model, testcases: testCases.map((x) => x.id) };
            await fileSystem.writeFile(filePath, JSON.stringify(data, null, 4));

            dispatch('saved');
            return true;
        }

        formDataDispatch({ type: FormDataActionType.ShowAllErrors });
        return false;
    };

    const handleSelectTestCase = async (index: number, key: string, value: any) => {
        handleItemChange(index, key, value);
    };

    const handleItemChange = (index: number, key: string, value: any) => {
        const item = { ...$listData.items[index] };
        item[key] = value;

        listDataDispatch({
            type: ListDataActionType.UpdateItem,
            index,
            item,
        });

        dispatchChange();
    };

    const dispatchChange = () => {
        dispatch('change');
    };

    const handleDeleteClick = (index: number) => {
        // Determine if this row has any input.
        // If yes, show confirmation dialog. Otherwise, delete straight away
        if (isEmptyItem($listData.items[index])) {
            doDeleteRow(index);
        } else {
            deleteDialogType = AlertDialogType.Question;
            indexToDelete = index;
        }
    };

    const isEmptyItem = (item: IDictionary) => {
        return Object.entries(item)
            .map(([key, value]) => value)
            .every((x) => !x);
    };

    const handleDeleteConfirmation = async (event: any) => {
        if (event.detail.button === 'delete') {
            doDeleteRow(indexToDelete);
        }
    };

    const doDeleteRow = (index: number) => {
        listDataDispatch({
            type: ListDataActionType.RemoveItem,
            index: index,
        });

        dispatchChange();
    };

    const handleMoveUpClick = (index: number) => {
        if (index >= 1 && index <= $listData.items.length - 1) {
            listDataDispatch({
                type: ListDataActionType.SwapItems,
                indexA: index,
                indexB: index - 1,
            });

            dispatchChange();
        }
    };

    const handleMoveDownClick = (index: number) => {
        if (index >= 0 && index <= $listData.items.length - 2) {
            listDataDispatch({
                type: ListDataActionType.SwapItems,
                indexA: index,
                indexB: index + 1,
            });

            dispatchChange();
        }
    };

    const handleAddTestCase = () => {
        listDataDispatch({
            type: ListDataActionType.AppendItems,
            items: [{}],
            hasMoreItems: false,
        });

        dispatchChange();
    };
</script>

<div class="test-case-editor p-8">
    <div class="font-semibold text-xl mb-4">{title}</div>
    <Form {formContext}>
        <FormGroup columns={1}>
            <FormGroupColumn>
                <FormTextField
                    name="description"
                    theme={uiTheme.inlineTextField}
                    on:input={dispatchChange}
                    displayLabel={false}
                    placeholder={uiContext.str(stringResKeys.testSuiteEditor.description)}
                />
            </FormGroupColumn>
        </FormGroup>
    </Form>

    <ListTable
        class="table-fixed mb-8"
        isProcessing={$formMode.isLoading() || $formMode.isProcessing()}
        isEmpty={false}
    >
        <svelte:fragment slot="header">
            <ListTableHeaderCell type={ListTableCellType.First} class="text-left w-11/12">
                {uiContext.str(stringResKeys.testSuiteEditor.testCase)}
            </ListTableHeaderCell>
            <ListTableHeaderCell type={ListTableCellType.LastAction} class="text-center w-1/12">
                {uiContext.str(stringResKeys.testSuiteEditor.actions)}
            </ListTableHeaderCell>
        </svelte:fragment>
        <svelte:fragment slot="body">
            {#each $listData.items as item, index}
                <ListTableBodyRow>
                    <ListTableBodyCell type={ListTableCellType.First}>
                        <FancyDropdownField
                            name={`${formContext.formName}_${index}_id`}
                            value={item.id}
                            options={testCaseOptions}
                            on:change={(event) => handleSelectTestCase(index, 'id', event.detail.value)}
                        />
                    </ListTableBodyCell>

                    <ListTableBodyCell type={ListTableCellType.LastAction} class="align-bottom whitespace-nowrap">
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
                        {#if index < $listData.items.length - 1}
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

    <div class="flex items-center gap-x-2">
        <IconLinkButton on:click={handleAddTestCase}>
            <svelte:fragment slot="icon"><AddIcon /></svelte:fragment>
            <svelte:fragment slot="label">
                {uiContext.str(stringResKeys.testSuiteEditor.addTestCase)}
            </svelte:fragment>
        </IconLinkButton>

        <div class="ml-auto">
            <PrimaryButton on:click={handleSave}>
                <span class="flex items-center gap-x-2">
                    <SaveIcon class="w-5 h-5" />
                    {uiContext.str(stringResKeys.general.save)}
                </span>
            </PrimaryButton>
        </div>
    </div>
</div>

<AlertDialog
    id="dialogDeleteRow"
    bind:type={deleteDialogType}
    buttons={AlertDialogButtons.DeleteCancel}
    on:click={handleDeleteConfirmation}
>
    <div slot="title">{uiContext.str(stringResKeys.general.confirmation)}</div>
    <div slot="content">{uiContext.str(stringResKeys.testSuiteEditor.deleteRowConfirmation)}</div>
</AlertDialog>
