<script lang="ts">
    import { appContextKey, type IAppContext } from "$lib/context/AppContext";
    import { stringResKeys } from "$lib/context/StringResKeys";
    import { uiContextKey, type IUiContext } from "$lib/context/UiContext";
    import type { IUiTheme } from "$lib/context/UiTheme";
    import type { IDropdownOption } from "$lib/controls/DropdownField";
    import FancyDropdownField from "$lib/controls/FancyDropdownField.svelte";
    import FormGroup from "$lib/controls/layout/FormGroup.svelte";
    import FormGroupColumn from "$lib/controls/layout/FormGroupColumn.svelte";
    import Form from "$lib/form-controls/Form.svelte";
    import FormTextField from "$lib/form-controls/TextField.svelte";
    import { FieldDataType, type IDictionary } from "$lib/form/FieldDef";
    import { createFormContext } from "$lib/form/FormContext";
    import { FormDataActionType } from "$lib/form/FormData";
    import type { IFormDef } from "$lib/form/FormDef";
    import { FormModeState } from "$lib/form/FormMode";
    import { FormSerializer } from "$lib/form/FormSerializer";
    import { createListDataContext, ListDataActionType } from "$lib/form/ListData";
    import type { IListDef } from "$lib/form/ListDef";
    import AddIcon from "$lib/icons/AddIcon.svelte";
    import DeleteIcon from "$lib/icons/DeleteIcon.svelte";
    import MoveDownIcon from "$lib/icons/MoveDownIcon.svelte";
    import MoveUpIcon from "$lib/icons/MoveUpIcon.svelte";
    import SaveIcon from "$lib/icons/SaveIcon.svelte";
    import { fileSystem } from "$lib/ipc";
    import { fileDefFactory, type ITestSuite } from "rockmelonqa.common";
    import { createEventDispatcher, getContext, onMount } from "svelte";
    import { derived } from "svelte/store";
    import { AlertDialogButtons, AlertDialogType } from "../Alert";
    import AlertDialog from "../AlertDialog.svelte";
    import { appActionContextKey, type IAppActionContext } from "../Application";
    import { combinePath } from "../FileExplorer/Node";
    import IconLinkButton from "../IconLinkButton.svelte";
    import { ListTableCellType } from "../ListTable";
    import ListTable from "../ListTable.svelte";
    import ListTableBodyCell from "../ListTableBodyCell.svelte";
    import ListTableBodyRow from "../ListTableBodyRow.svelte";
    import ListTableHeaderCell from "../ListTableHeaderCell.svelte";
    import PrimaryButton from "../PrimaryButton.svelte";
    import { toTitle } from "./Editor";
    import type { ButtonOptions, GridConfig } from "./DynamicGrid/DynamicGrid";
    import DynamicGrid from "./DynamicGrid/DynamicGrid.svelte";
    import DynamicCell from "./DynamicGrid/DynamicCell.svelte";
    import ActionsMenu from "./DynamicGrid/ActionsMenu.svelte";

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
                dataPath: "id",
                isRequired: true,
            },
            description: {
                dataType: FieldDataType.Text,
                dataPath: "description",
            },
        },
    };
    let formContext = createFormContext("testSuiteEditor", formDef, uiContext, FormModeState.Edit);
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
                dataPath: "id",
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

            dispatch("saved");
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
        dispatch("change");
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
        if (event.detail.button === "delete") {
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

    const gridConfig: GridConfig = {
        gridType: "TestCaseItems",
        columns: [
            {
                defaultSizePercentage: 80,
                title: uiContext.str(stringResKeys.testSuiteEditor.testCase),
            },
            {
                defaultSizePercentage: 20,
                title: uiContext.str(stringResKeys.testCaseEditor.actions),
            },
        ],
    };

    const buildActionMenuButtons = (index: number): ButtonOptions[] => {
        return [
            {
                label: uiContext.str(stringResKeys.general.delete),
                icon: DeleteIcon,
                action: handleDeleteClick,
                visible: true,
            },
            {
                label: uiContext.str(uiContext.str(stringResKeys.general.moveUp)),
                icon: MoveUpIcon,
                action: handleMoveUpClick,
                visible: index > 0,
            },
            {
                label: uiContext.str(stringResKeys.general.moveDown),
                icon: MoveDownIcon,
                action: handleMoveDownClick,
                visible: index < $listData.items.length - 1,
            },
        ];
    };
</script>

<div class="flex-1 test-suite-editor p-8 flex flex-col">
    <div class="font-semibold text-xl mb-4 flex-grow-0">{title}</div>
    <Form {formContext} class="flex-grow-0">
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

    <div class="flex-1 min-h-0 flex flex-col pb-0">
        <DynamicGrid config={gridConfig} items={$listData.items} class="h-full flex flex-col">
            <svelte:fragment slot="item" let:item let:index>
                <DynamicCell>
                    <FancyDropdownField
                        name={`${formContext.formName}_${index}_id`}
                        value={item.id}
                        options={testCaseOptions}
                        on:change={(event) => handleSelectTestCase(index, "id", event.detail.value)}
                    />
                </DynamicCell>
                <DynamicCell allowHighlight={false}>
                    <ActionsMenu {index} buttons={buildActionMenuButtons(index)} />
                </DynamicCell>
            </svelte:fragment>
        </DynamicGrid>
    </div>

    <div class="flex items-center flex-grow-0 py-4">
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
