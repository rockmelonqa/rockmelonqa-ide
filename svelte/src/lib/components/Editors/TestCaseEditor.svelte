<script lang="ts">
    import { appContextKey, type IAppContext } from "$lib/context/AppContext";
    import { stringResKeys } from "$lib/context/StringResKeys";
    import { uiContextKey, type IUiContext } from "$lib/context/UiContext";
    import type { IUiTheme } from "$lib/context/UiTheme";
    import type { IDropdownOption } from "$lib/controls/DropdownField";
    import FancyDropdownField from "$lib/controls/FancyDropdownField.svelte";
    import FormGroup from "$lib/controls/layout/FormGroup.svelte";
    import FormGroupColumn from "$lib/controls/layout/FormGroupColumn.svelte";
    import TextField from "$lib/controls/TextField.svelte";
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
    import CommentIcon from "$lib/icons/CommentIcon.svelte";
    import DeleteIcon from "$lib/icons/DeleteIcon.svelte";
    import ListIcon from "$lib/icons/ListIcon.svelte";
    import MoveDownIcon from "$lib/icons/MoveDownIcon.svelte";
    import MoveUpIcon from "$lib/icons/MoveUpIcon.svelte";
    import SaveIcon from "$lib/icons/SaveIcon.svelte";
    import { fileSystem } from "$lib/ipc";
    import { getActionTypeDropDownOptions } from "$lib/utils/dropdowns";
    import { ActionType, fileDefFactory, type ITestCase, type ITestCaseStep as ITestStep } from "rockmelonqa.common";
    import { createEventDispatcher, getContext, onMount } from "svelte";
    import { derived } from "svelte/store";
    import { v4 as uuidv4 } from "uuid";
    import { AlertDialogButtons, AlertDialogType } from "../Alert";
    import AlertDialog from "../AlertDialog.svelte";
    import { appActionContextKey, type IAppActionContext } from "../Application";
    import CommentTextField from "../CommentTextField.svelte";
    import { combinePath } from "../FileExplorer/Node";
    import IconLinkButton from "../IconLinkButton.svelte";
    import { ListTableCellType } from "../ListTable";
    import ListTable from "../ListTable.svelte";
    import ListTableBodyCell from "../ListTableBodyCell.svelte";
    import ListTableBodyRow from "../ListTableBodyRow.svelte";
    import ListTableHeaderCell from "../ListTableHeaderCell.svelte";
    import PrimaryButton from "../PrimaryButton.svelte";
    import { toTitle, isPagelessAction } from "./Editor";
    import type { ITestStepComment } from "rockmelonqa.common/file-defs/shared";
    import type { ITestCaseStep } from "rockmelonqa.common/file-defs/testCaseFile";
    import { removeFileExtension } from "$lib/utils/utils";
    import RoutinePickerDialog from "$lib/dialogs/RoutinePickerDialog.svelte";
    import DynamicCell from "./DynamicGrid/DynamicCell.svelte";
    import DynamicGrid from "./DynamicGrid/DynamicGrid.svelte";
    import type { ButtonOptions, GridConfig } from "./DynamicGrid/DynamicGrid";
    import ActionsMenu from "./DynamicGrid/ActionsMenu.svelte";

    const uiContext = getContext(uiContextKey) as IUiContext;
    const { theme } = uiContext;
    const uiTheme = $theme as IUiTheme;

    const ITEM_KEY_ACTION = "action";
    const ITEM_KEY_ELEMENT = "element";
    const ITEM_KEY_PAGE = "page";
    const ITEM_KEY_DATA = "data";

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
    let formContext = createFormContext("testCaseEditor", formDef, uiContext, FormModeState.Edit);
    let {
        mode: formMode,
        modeDispatch: formModeDispatch,
        data: formData,
        dataDispatch: formDataDispatch,
    } = formContext;

    const listDef: IListDef = {
        fields: {
            id: {
                dataType: FieldDataType.Text,
                dataPath: "id",
            },
            type: {
                dataType: FieldDataType.Text,
                dataPath: "type",
            },
            page: {
                dataType: FieldDataType.Dropdown,
                dataPath: "page",
            },
            element: {
                dataType: FieldDataType.Dropdown,
                dataPath: "element",
            },
            action: {
                dataType: FieldDataType.Dropdown,
                dataPath: "action",
            },
            data: {
                dataType: FieldDataType.Text,
                dataPath: "data",
            },
            comment: {
                dataType: FieldDataType.Text,
                dataPath: "comment",
            },
        },
    };
    let listDataContext = createListDataContext(listDef, uiContext);
    let { value: listData, dispatch: listDataDispatch } = listDataContext;

    $: title = toTitle(fileName);
    let deleteDialogType: AlertDialogType = AlertDialogType.None;
    let indexToDelete: number;

    let pageDefinitionOptions: IDropdownOption[] = [];
    // Key: page id.  Value: page element options
    let pageElementsMap: Map<string, IDropdownOption[]>;
    let actionTypeOptions: IDropdownOption[] = getActionTypeDropDownOptions(uiContext);

    const { registerOnSaveHandler, unregisterOnSaveHandler } = getContext(appActionContextKey) as IAppActionContext;
    const dispatch = createEventDispatcher();

    const pagesSubscription = derived(appState, ($appState) => $appState.pages);
    pagesSubscription.subscribe((pages) => {
        pageDefinitionOptions = Array.from(pages.entries())
            .map(([key, { name }]) => ({ key, text: removeFileExtension(name) } as IDropdownOption))
            .sort((a, b) => a.text.localeCompare(b.text));

        pageElementsMap = new Map();
        for (const [pageId, pageData] of pages) {
            // only get completed row
            const elements = Array.from(pageData.elements.values()).filter(
                (e) => e.id && e.name != null && e.findBy != null && e.locator != null
            );

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

    let lastUsedPage: string | undefined = undefined;

    onMount(async () => {
        // default/empty data
        let model: ITestCase = fileDefFactory.newTestCase();

        // parse file content if any
        const fileContent = await fileSystem.readFile(filePath);
        if (fileContent) {
            model = JSON.parse(fileContent) as ITestCase;
        }

        const serializer = new FormSerializer(uiContext);
        const fieldValues = serializer.deserialize(model, formDef.fields);
        formDataDispatch({ type: FormDataActionType.Load, newValues: fieldValues });

        const items = serializer.deserializeList(model.steps, listDef.fields);
        items.forEach((item, index) => {
            const step = model.steps[index];
            if (step.type === "testStep") {
                item.parameters = step.parameters;
            }
        });
        listDataDispatch({ type: ListDataActionType.SetItems, items: items, hasMoreItems: false });

        registerOnSaveHandler(contentIndex, doSave);

        lastUsedPage = items.findLast((item) => isTestStep(item) && !isPagelessAction(item.action))?.page;

        return () => {
            unregisterOnSaveHandler(contentIndex);
        };
    });

    const isComment = (item: IDictionary) => {
        return (item as ITestStep).type === "comment";
    };

    const isTestStep = (item: IDictionary) => {
        return (item as ITestStep).type === "testStep";
    };

    const handleSave = async () => {
        await doSave();
    };

    const doSave = async (): Promise<boolean> => {
        if ($formData.isValid) {
            const serializer = new FormSerializer(uiContext);
            const model = serializer.serialize($formData.values, formDef.fields);

            const items = $listData.items.filter((r) => !isEmptyItem(r));
            const steps = serializer.serializeList(items, listDef.fields);
            steps.forEach((step, index) => {
                const item = items[index];
                if (item.type === "testStep") {
                    step.parameters = item.parameters;
                }
            });

            const data = { ...model, steps };
            const filePath = combinePath([folderPath, fileName], uiContext.pathSeparator);
            await fileSystem.writeFile(filePath, JSON.stringify(data, null, 4));

            dispatch("saved");
            return true;
        }

        formDataDispatch({ type: FormDataActionType.ShowAllErrors });
        return false;
    };

    const handleItemChange = (index: number, key: string, value: any) => {
        const item = { ...$listData.items[index] };
        item[key] = value;

        if (key == "action") {
            if (isPagelessAction(value)) {
                item[ITEM_KEY_ELEMENT] = "";
                item[ITEM_KEY_PAGE] = "";
            }
        }

        listDataDispatch({
            type: ListDataActionType.UpdateItem,
            index,
            item,
        });

        dispatchChange();
    };
    const handlePageChange = (index: number, value: any) => {
        lastUsedPage = value;
        handleItemChange(index, ITEM_KEY_PAGE, value);
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
        const ignoredProperties: string[] = ["id", "type"];
        return Object.entries(item)
            .filter(([key, value]) => !ignoredProperties.includes(key))
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

    const handleAddStep = () => {
        listDataDispatch({
            type: ListDataActionType.AppendItems,
            items: [newStep()],
            hasMoreItems: false,
        });

        dispatchChange();
    };
    const handleInsertStep = (index: number) => {
        listDataDispatch({
            type: ListDataActionType.InsertItem,
            item: newStep(),
            index: index + 1,
        });

        dispatchChange();
    };
    const newStep = (): ITestCaseStep => {
        return {
            id: uuidv4(),
            type: "testStep",
            name: "",
            description: "",
            data: "",
            page: lastUsedPage,
        } as ITestCaseStep;
    };

    const handleAddComment = () => {
        listDataDispatch({
            type: ListDataActionType.AppendItems,
            items: [newComment()],
            hasMoreItems: false,
        });

        dispatchChange();
    };

    const handleInsertComment = (index: number) => {
        listDataDispatch({
            type: ListDataActionType.InsertItem,
            item: newComment(),
            index: index + 1,
        });

        dispatchChange();
    };
    const newComment = (): ITestStepComment => {
        return { id: uuidv4(), type: "comment", comment: "" } as ITestStepComment;
    };

    const toRoutineData = (item: IDictionary): string => {
        if (item.action !== ActionType.RunTestRoutine) {
            return item.data;
        }

        const routineId: string = item.data ?? "";
        const datasets: string[] = item.parameters ?? [];

        const routine = $appState.testRoutines.get(routineId);
        if (routine) {
            let label = removeFileExtension(routine.name);

            // no dataset or select all
            if (datasets.length === 0 || (datasets.length === 1 && datasets[0] === "*")) {
                return label;
            }

            // select few datasets
            const selectedDataSet =
                datasets.filter((key) => routine.datasets.has(key)).map((key) => routine.datasets.get(key)!.name) ?? [];
            if (selectedDataSet.length > 0) {
                label = label + "[" + selectedDataSet.join(", ") + "]";
            }

            return label;
        }

        return "";
    };

    let showRoutinePickerDialog: boolean = false;
    let indexToSelectRoutine: number;
    let selectingRoutineId: string = "";
    let selectingDatasets: string[] = [];
    const handleShowRoutinePickerDialog = (stepItem: IDictionary, stepIndex: number) => {
        showRoutinePickerDialog = true;
        indexToSelectRoutine = stepIndex;
        selectingRoutineId = stepItem.data ?? "";
        selectingDatasets = stepItem.parameters ?? [];
    };

    const handleSelectRoutine = (e: any) => {
        showRoutinePickerDialog = false;
        const value = e.detail.value;

        const item = { ...$listData.items[indexToSelectRoutine] };
        (item.data = value.routine), (item.parameters = value.datasets);

        listDataDispatch({
            type: ListDataActionType.UpdateItem,
            index: indexToSelectRoutine,
            item,
        });

        dispatchChange();
    };

    const gridConfig: GridConfig = {
        gridType: "TestCaseItems",
        columns: [
            {
                defaultSizePercentage: 20,
                title: uiContext.str(stringResKeys.testCaseEditor.action),
            },
            {
                defaultSizePercentage: 20,
                title: uiContext.str(stringResKeys.testCaseEditor.page),
            },
            {
                defaultSizePercentage: 20,
                title: uiContext.str(stringResKeys.testCaseEditor.element),
            },
            {
                defaultSizePercentage: 25,
                title: uiContext.str(stringResKeys.testCaseEditor.data),
            },
            {
                defaultSizePercentage: 15,
                title: uiContext.str(stringResKeys.testCaseEditor.actions),
            },
        ],
    };

    const buildActionMenuButtons = (index: number): ButtonOptions[] => {
        return [
            {
                label: uiContext.str(stringResKeys.general.add),
                icon: AddIcon,
                action: handleInsertStep,
                visible: true,
            },
            {
                label: uiContext.str(stringResKeys.general.delete),
                icon: DeleteIcon,
                action: handleDeleteClick,
                visible: true,
            },
            {
                label: uiContext.str(stringResKeys.general.addComment),
                icon: CommentIcon,
                action: handleInsertComment,
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

<div class="flex-1 test-case-editor p-8 pb-0 flex flex-col">
    <div class="font-semibold text-xl mb-4 flex-grow-0">{title}</div>
    <Form {formContext} class="flex-grow-0">
        <FormGroup columns={1}>
            <FormGroupColumn>
                <FormTextField
                    name="description"
                    theme={uiTheme.inlineTextField}
                    on:input={dispatchChange}
                    displayLabel={false}
                    placeholder={uiContext.str(stringResKeys.testCaseEditor.description)}
                />
            </FormGroupColumn>
        </FormGroup>
    </Form>

    <div class="flex-1 min-h-0">
        <DynamicGrid config={gridConfig} items={$listData.items} class="h-full flex flex-col">
            <svelte:fragment slot="item" let:item let:index>
                {#if isTestStep(item)}
                    <DynamicCell>
                        <FancyDropdownField
                            name={`${formContext.formName}_${index}_action`}
                            value={item.action}
                            options={actionTypeOptions}
                            on:change={(event) => handleItemChange(index, ITEM_KEY_ACTION, event.detail.value)}
                        />
                    </DynamicCell>
                    <DynamicCell>
                        {#if !isPagelessAction(item.action)}
                            <FancyDropdownField
                                name={`${formContext.formName}_${index}_page`}
                                value={item.page}
                                options={pageDefinitionOptions}
                                on:change={(event) => handlePageChange(index, event.detail.value)}
                            />
                        {/if}
                    </DynamicCell>
                    <DynamicCell>
                        {#if !isPagelessAction(item.action)}
                            <FancyDropdownField
                                name={`${formContext.formName}_${index}_element`}
                                value={item.element}
                                options={pageElementsMap.get(item.page) ?? []}
                                on:change={(event) => handleItemChange(index, ITEM_KEY_ELEMENT, event.detail.value)}
                            />
                        {/if}
                    </DynamicCell>
                    <DynamicCell>
                        {#if item.action === ActionType.RunTestRoutine.toString()}
                            <div class="flex justify-between items-center">
                                <div class="grow">
                                    <TextField
                                        name={`${formContext.formName}_${index}_data`}
                                        value={toRoutineData(item)}
                                        class="truncate"
                                        readonly={true}
                                    />
                                </div>
                                <IconLinkButton
                                    on:click={() => handleShowRoutinePickerDialog(item, index)}
                                    title="Select routine"
                                >
                                    <svelte:fragment slot="icon"
                                        ><ListIcon class="h-5 w-5" strokeColor="var(--color-brand)" /></svelte:fragment
                                    >
                                </IconLinkButton>
                            </div>
                        {:else}
                            <TextField
                                name={`${formContext.formName}_${index}_data`}
                                value={item.data}
                                on:input={(event) => handleItemChange(index, ITEM_KEY_DATA, event.detail.value)}
                            />
                        {/if}
                    </DynamicCell>
                {:else if isComment(item)}
                    <DynamicCell colspan={gridConfig.columns.length - 1 + (gridConfig.columns.length - 2)}>
                        <CommentTextField
                            class="!bg-transparent"
                            name={`${formContext.formName}_${index}_comment`}
                            value={item.comment}
                            placeholder={uiContext.str(stringResKeys.testCaseEditor.comment)}
                            on:input={(event) => handleItemChange(index, "comment", event.detail.value)}
                        />
                    </DynamicCell>
                {:else}
                    <DynamicCell isLast={true} colspan={gridConfig.columns.length - 1}>
                        <i class="text-red">(This item cannot be shown)</i>
                    </DynamicCell>
                {/if}
                <DynamicCell isLast={true}>
                    <ActionsMenu {index} buttons={buildActionMenuButtons(index)} />
                </DynamicCell>
            </svelte:fragment>
        </DynamicGrid>
    </div>

    <div class="flex items-center gap-x-2 flex-grow-0 py-4">
        <IconLinkButton on:click={handleAddStep}>
            <svelte:fragment slot="icon"><AddIcon /></svelte:fragment>
            <svelte:fragment slot="label">
                {uiContext.str(stringResKeys.testCaseEditor.addStep)}
            </svelte:fragment>
        </IconLinkButton>
        <span>|</span>
        <IconLinkButton on:click={handleAddComment}>
            <svelte:fragment slot="icon"><CommentIcon /></svelte:fragment>
            <svelte:fragment slot="label">
                {uiContext.str(stringResKeys.testCaseEditor.addComment)}
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
    <div slot="content">{uiContext.str(stringResKeys.testCaseEditor.deleteRowConfirmation)}</div>
</AlertDialog>

{#if showRoutinePickerDialog}
    <RoutinePickerDialog
        routine={selectingRoutineId}
        datasets={selectingDatasets}
        on:submit={handleSelectRoutine}
        on:cancel={() => (showRoutinePickerDialog = false)}
    />
{/if}
