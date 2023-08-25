<script lang="ts">
    import { stringResKeys } from "$lib/context/StringResKeys";
    import { uiContextKey, type IUiContext } from "$lib/context/UiContext";
    import type { IUiTheme } from "$lib/context/UiTheme";
    import FancyDropdownField from "$lib/controls/FancyDropdownField.svelte";
    import TextField from "$lib/controls/TextField.svelte";
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
    import { ListDataActionType, createListDataContext } from "$lib/form/ListData";
    import type { IListDef } from "$lib/form/ListDef";
    import AddIcon from "$lib/icons/AddIcon.svelte";
    import CommentIcon from "$lib/icons/CommentIcon.svelte";
    import DeleteIcon from "$lib/icons/DeleteIcon.svelte";
    import MoveDownIcon from "$lib/icons/MoveDownIcon.svelte";
    import MoveUpIcon from "$lib/icons/MoveUpIcon.svelte";
    import SaveIcon from "$lib/icons/SaveIcon.svelte";
    import { fileSystem } from "$lib/ipc";
    import { getLocatorTypeDropDownOptions } from "$lib/utils/dropdowns";
    import { LocatorType, fileDefFactory } from "rockmelonqa.common";
    import type { IPage, IPageElement } from "rockmelonqa.common/file-defs/pageFile";
    import { createEventDispatcher, getContext, onMount } from "svelte";
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
    import { toTitle } from "./Editor";
    import type { GridConfig } from "./DynamicGrid/DynamicGrid";
    import DynamicGrid from "./DynamicGrid/DynamicGrid.svelte";
    import DynamicCell from "./DynamicGrid/DynamicCell.svelte";

    const uiContext = getContext(uiContextKey) as IUiContext;
    const { theme } = uiContext;
    const uiTheme = $theme as IUiTheme;

    export let folderPath: string;
    export let fileName: string;
    $: filePath = combinePath([folderPath, fileName], uiContext.pathSeparator);

    export let contentIndex: number;

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
    let formContext = createFormContext("pageDefinitionEditor", formDef, uiContext, FormModeState.Edit);
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
            name: {
                dataType: FieldDataType.Text,
                dataPath: "name",
                maxLength: 200,
            },
            findBy: {
                dataType: FieldDataType.Dropdown,
                dataPath: "findBy",
            },
            locator: {
                dataType: FieldDataType.Text,
                dataPath: "locator",
            },
            description: {
                dataType: FieldDataType.Text,
                dataPath: "description",
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
    const locatorTypeOptions = getLocatorTypeDropDownOptions(uiContext);

    let deleteDialogType: AlertDialogType = AlertDialogType.None;
    let indexToDelete: number;

    const { registerOnSaveHandler, unregisterOnSaveHandler } = getContext(appActionContextKey) as IAppActionContext;
    const dispatch = createEventDispatcher();

    let focusFieldId = "";

    onMount(async () => {
        // default/empty data
        let model: IPage = fileDefFactory.newPageDefinition();

        // parse file content if any
        const fileContent = await fileSystem.readFile(filePath);
        if (fileContent) {
            model = JSON.parse(fileContent) as IPage;
        }

        const serializer = new FormSerializer(uiContext);
        const fieldValues = serializer.deserialize(model, formDef.fields);
        formDataDispatch({ type: FormDataActionType.Load, newValues: fieldValues });

        const items = serializer.deserializeList(model.elements, listDef.fields);
        listDataDispatch({ type: ListDataActionType.SetItems, items: items, hasMoreItems: false });

        registerOnSaveHandler(contentIndex, doSave);

        return () => {
            unregisterOnSaveHandler(contentIndex);
        };
    });

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

    const handleAddElement = () => {
        focusFieldId = `pageDefinitionEditor_${$listData.items.length}_name_input`;

        listDataDispatch({
            type: ListDataActionType.AppendItems,
            items: [newElement()],
            hasMoreItems: false,
        });

        dispatchChange();
    };
    const handleInsertElement = (index: number) => {
        focusFieldId = `pageDefinitionEditor_${index + 1}_name_input`;

        listDataDispatch({
            type: ListDataActionType.InsertItem,
            item: newElement(),
            index: index + 1,
        });

        dispatchChange();
    };
    const newElement = (): IPageElement => {
        return {
            id: uuidv4(),
            type: "pageElement",
            name: "",
            findBy: undefined,
            locator: "",
            description: "",
        } as IPageElement;
    };

    const handleAddComment = () => {
        focusFieldId = `pageDefinitionEditor_${$listData.items.length}_comment_input`;

        listDataDispatch({
            type: ListDataActionType.AppendItems,
            items: [{ id: uuidv4(), type: "comment", comment: "" } as IPageElement],
            hasMoreItems: false,
        });

        dispatchChange();
    };
    const handleInsertComment = (index: number) => {
        focusFieldId = `pageDefinitionEditor_${index + 1}_comment_input`;

        listDataDispatch({
            type: ListDataActionType.InsertItem,
            item: newComment(),
            index: index + 1,
        });

        dispatchChange();
    };
    const newComment = (): IPageElement => {
        return { id: uuidv4(), type: "comment", comment: "" } as IPageElement;
    };

    const isComment = (item: IDictionary) => {
        return (item as IPageElement).type === "comment";
    };

    const handleSave = async () => {
        await doSave();
    };

    const doSave = async (): Promise<boolean> => {
        if (isDataValid) {
            const serializer = new FormSerializer(uiContext);
            const model = serializer.serialize($formData.values, formDef.fields);

            const items = $listData.items.filter((r) => !isEmptyItem(r));
            const elements = serializer.serializeList(items, listDef.fields);
            const data = { ...model, elements };
            await fileSystem.writeFile(filePath, JSON.stringify(data, null, 4));

            dispatch("saved");
            return true;
        }

        formDataDispatch({ type: FormDataActionType.ShowAllErrors });
        return false;
    };

    const isElementNameValid = (elementName: string) => {
        if (elementName) {
            const regex = /^[A-Za-z0-9]+$/;
            return regex.test(elementName);
        }

        return true;
    };
    $: isListDataValid = $listData.items.every((item) => isElementNameValid(item.name));
    $: isDataValid = $formData.isValid && isListDataValid;

    let gridConfig: GridConfig = {
        gridType: "PageElements",
        columns: [
            {
                defaultSizePercentage: 15,
                title: uiContext.str(stringResKeys.pageDefinitionEditor.elementName),
            },
            {
                defaultSizePercentage: 20,
                title: uiContext.str(stringResKeys.pageDefinitionEditor.findBy),
            },
            {
                defaultSizePercentage: 30,
                title: uiContext.str(stringResKeys.pageDefinitionEditor.locator),
            },
            {
                defaultSizePercentage: 20,
                title: uiContext.str(stringResKeys.pageDefinitionEditor.description),
            },
            {
                defaultSizePercentage: 15,
                title: uiContext.str(stringResKeys.pageDefinitionEditor.actions),
            },
        ],
    };
</script>

<div class="flex-1 page-definition-editor p-8 flex flex-col">
    <div class="font-semibold text-xl mb-4 flex-grow-0">{title}</div>
    <Form {formContext} class="flex-grow-0 ">
        <FormGroup columns={1}>
            <FormGroupColumn>
                <FormTextField
                    class="focus:border-b"
                    name="description"
                    theme={uiTheme.inlineTextField}
                    on:input={dispatchChange}
                    displayLabel={false}
                    placeholder={uiContext.str(stringResKeys.pageDefinitionEditor.description)}
                />
            </FormGroupColumn>
        </FormGroup>
    </Form>
    <div class="flex-1 min-h-0">
        <DynamicGrid config={gridConfig} items={$listData.items} class="h-full flex flex-col">
            <svelte:fragment slot="item" let:item let:index>
                {#if item.type === "pageElement"}
                    <DynamicCell>
                        <TextField
                            class="py-2 px-3 h-auto border-white focus:border-b"
                            name={`${formContext.formName}_${index}_name`}
                            value={item.name}
                            on:input={(event) => handleItemChange(index, "name", event.detail.value)}
                            errorMessage={isElementNameValid(item.name)
                                ? ""
                                : uiContext.str(stringResKeys.pageDefinitionEditor.elementNameInvalidMessage)}
                            focus={`${formContext.formName}_${index}_name_input` === focusFieldId}
                        />
                    </DynamicCell>
                    <DynamicCell>
                        <FancyDropdownField
                            class="py-2 px-3 h-auto border-white focus:border-b"
                            name={`${formContext.formName}_${index}_findBy`}
                            value={item.findBy}
                            options={locatorTypeOptions}
                            on:change={(event) => handleItemChange(index, "findBy", event.detail.value)}
                        />
                    </DynamicCell>
                    <DynamicCell>
                        <TextField
                            class="py-2 px-3 h-auto border-white focus:border-b"
                            placeholder={(item.findBy === LocatorType.RelativeCss ? "MyField:.css-class-name" : "") ||
                                (item.findBy === LocatorType.RelativeXpath ? "MyField://div[text() = 'abc']" : "")}
                            name={`${formContext.formName}_${index}_locator`}
                            value={item.locator}
                            on:input={(event) => handleItemChange(index, "locator", event.detail.value)}
                        />
                    </DynamicCell>
                    <DynamicCell>
                        <TextField
                            class="py-2 px-3 h-auto border-white focus:border-b"
                            name={`${formContext.formName}_${index}_description`}
                            value={item.description}
                            on:input={(event) => handleItemChange(index, "description", event.detail.value)}
                        />
                    </DynamicCell>
                    <DynamicCell isLast={true}>
                        <IconLinkButton
                            on:click={() => handleInsertElement(index)}
                            title={uiContext.str(stringResKeys.pageDefinitionEditor.addElement)}
                        >
                            <svelte:fragment slot="icon"><AddIcon /></svelte:fragment>
                        </IconLinkButton>
                        <IconLinkButton
                            on:click={() => handleInsertComment(index)}
                            title={uiContext.str(stringResKeys.pageDefinitionEditor.addComment)}
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
                        {#if index < $listData.items.length - 1}
                            <IconLinkButton
                                on:click={() => handleMoveDownClick(index)}
                                title={uiContext.str(stringResKeys.general.moveDown)}
                            >
                                <svelte:fragment slot="icon"><MoveDownIcon /></svelte:fragment>
                            </IconLinkButton>
                        {/if}
                    </DynamicCell>
                {:else if item.type === "comment"}
                    <DynamicCell colspan={gridConfig.columns.length - 1}>
                        <CommentTextField
                            class="py-2 px-3 h-auto"
                            name={`${formContext.formName}_${index}_comment`}
                            value={item.comment}
                            placeholder={uiContext.str(stringResKeys.pageDefinitionEditor.comment)}
                            on:input={(event) => handleItemChange(index, "comment", event.detail.value)}
                            focus={`${formContext.formName}_${index}_comment_input` === focusFieldId}
                        />
                    </DynamicCell>
                    <DynamicCell isLast={true}>
                        <IconLinkButton
                            on:click={() => handleInsertElement(index)}
                            title={uiContext.str(stringResKeys.pageDefinitionEditor.addElement)}
                        >
                            <svelte:fragment slot="icon"><AddIcon /></svelte:fragment>
                        </IconLinkButton>
                        <IconLinkButton
                            on:click={() => handleInsertComment(index)}
                            title={uiContext.str(stringResKeys.pageDefinitionEditor.addComment)}
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
                        {#if index < $listData.items.length - 1}
                            <IconLinkButton
                                on:click={() => handleMoveDownClick(index)}
                                title={uiContext.str(stringResKeys.general.moveDown)}
                            >
                                <svelte:fragment slot="icon"><MoveDownIcon /></svelte:fragment>
                            </IconLinkButton>
                        {/if}
                    </DynamicCell>
                {:else}
                    <DynamicCell isLast={true} colspan={gridConfig.columns.length}>
                        <i class="text-red">(This item cannot be shown)</i>
                    </DynamicCell>
                {/if}
            </svelte:fragment>
        </DynamicGrid>
    </div>

    <ListTable
        class="table-fixed mb-8 hidden"
        isProcessing={$formMode.isLoading() || $formMode.isProcessing()}
        isEmpty={false}
    >
        <svelte:fragment slot="header">
            <ListTableHeaderCell type={ListTableCellType.First} class="text-left w-1/6">
                {uiContext.str(stringResKeys.pageDefinitionEditor.elementName)}
            </ListTableHeaderCell>
            <ListTableHeaderCell type={ListTableCellType.Normal} class="text-left w-52">
                {uiContext.str(stringResKeys.pageDefinitionEditor.findBy)}
            </ListTableHeaderCell>
            <ListTableHeaderCell type={ListTableCellType.Normal} class="text-left">
                {uiContext.str(stringResKeys.pageDefinitionEditor.locator)}
            </ListTableHeaderCell>
            <ListTableHeaderCell type={ListTableCellType.Last} class="text-left w-1/6">
                {uiContext.str(stringResKeys.pageDefinitionEditor.description)}
            </ListTableHeaderCell>
            <ListTableHeaderCell type={ListTableCellType.LastAction} class="text-center w-40">
                {uiContext.str(stringResKeys.pageDefinitionEditor.actions)}
            </ListTableHeaderCell>
        </svelte:fragment>
        <svelte:fragment slot="body">
            {#each $listData.items as item, index (item.id)}
                <ListTableBodyRow>
                    {#if isComment(item)}
                        <ListTableBodyCell type={ListTableCellType.First} colspan={4}>
                            <CommentTextField
                                name={`${formContext.formName}_${index}_comment`}
                                value={item.comment}
                                placeholder={uiContext.str(stringResKeys.pageDefinitionEditor.comment)}
                                on:input={(event) => handleItemChange(index, "comment", event.detail.value)}
                                focus={`${formContext.formName}_${index}_comment_input` === focusFieldId}
                            />
                        </ListTableBodyCell>
                    {:else}
                        <ListTableBodyCell type={ListTableCellType.First}>
                            <TextField
                                name={`${formContext.formName}_${index}_name`}
                                value={item.name}
                                on:input={(event) => handleItemChange(index, "name", event.detail.value)}
                                errorMessage={isElementNameValid(item.name)
                                    ? ""
                                    : uiContext.str(stringResKeys.pageDefinitionEditor.elementNameInvalidMessage)}
                                focus={`${formContext.formName}_${index}_name_input` === focusFieldId}
                            />
                        </ListTableBodyCell>
                        <ListTableBodyCell type={ListTableCellType.Normal}>
                            <FancyDropdownField
                                name={`${formContext.formName}_${index}_findBy`}
                                value={item.findBy}
                                options={locatorTypeOptions}
                                on:change={(event) => handleItemChange(index, "findBy", event.detail.value)}
                            />
                        </ListTableBodyCell>
                        <ListTableBodyCell type={ListTableCellType.Normal}>
                            <TextField
                                placeholder={(item.findBy === LocatorType.RelativeCss
                                    ? "MyField:.css-class-name"
                                    : "") ||
                                    (item.findBy === LocatorType.RelativeXpath ? "MyField://div[text() = 'abc']" : "")}
                                name={`${formContext.formName}_${index}_locator`}
                                value={item.locator}
                                on:input={(event) => handleItemChange(index, "locator", event.detail.value)}
                            />
                        </ListTableBodyCell>
                        <ListTableBodyCell type={ListTableCellType.Last}>
                            <TextField
                                name={`${formContext.formName}_${index}_description`}
                                value={item.description}
                                on:input={(event) => handleItemChange(index, "description", event.detail.value)}
                            />
                        </ListTableBodyCell>
                    {/if}
                    <ListTableBodyCell type={ListTableCellType.LastAction} class="align-bottom whitespace-nowrap">
                        <IconLinkButton
                            on:click={() => handleInsertElement(index)}
                            title={uiContext.str(stringResKeys.pageDefinitionEditor.addElement)}
                        >
                            <svelte:fragment slot="icon"><AddIcon /></svelte:fragment>
                        </IconLinkButton>
                        <IconLinkButton
                            on:click={() => handleInsertComment(index)}
                            title={uiContext.str(stringResKeys.pageDefinitionEditor.addComment)}
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

    <div class="flex items-center gap-x-2 flex-grow-0">
        <IconLinkButton on:click={handleAddElement}>
            <svelte:fragment slot="icon"><AddIcon /></svelte:fragment>
            <svelte:fragment slot="label">
                {uiContext.str(stringResKeys.pageDefinitionEditor.addElement)}
            </svelte:fragment>
        </IconLinkButton>
        <span>|</span>
        <IconLinkButton on:click={handleAddComment}>
            <svelte:fragment slot="icon"><CommentIcon /></svelte:fragment>
            <svelte:fragment slot="label">
                {uiContext.str(stringResKeys.pageDefinitionEditor.addComment)}
            </svelte:fragment>
        </IconLinkButton>

        <div class="ml-auto">
            <PrimaryButton on:click={handleSave} disabled={!isDataValid}>
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
    <div slot="content">{uiContext.str(stringResKeys.pageDefinitionEditor.deleteRowConfirmation)}</div>
</AlertDialog>
