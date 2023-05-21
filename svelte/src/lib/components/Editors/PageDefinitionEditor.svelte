<script lang="ts">
    import { stringResKeys } from "$lib/context/StringResKeys";
    import { uiContextKey, type IUiContext } from "$lib/context/UiContext";
    import type { IUiTheme } from "$lib/context/UiTheme";
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
    import MoveDownIcon from "$lib/icons/MoveDownIcon.svelte";
    import MoveUpIcon from "$lib/icons/MoveUpIcon.svelte";
    import SaveIcon from "$lib/icons/SaveIcon.svelte";
    import { fileSystem } from "$lib/ipc";
    import { getLocatorTypeDropDownOptions } from "$lib/utils/dropdowns";
    import { fileDefFactory } from "rockmelonqa.common";
    import type { IPage, IPageElement } from "rockmelonqa.common/file-defs/pageFile";
    import { createEventDispatcher, getContext, onMount, tick } from "svelte";
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
    import { FieldValidator } from "$lib/form/FieldValidator";

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
                isRequired: true,
                isRequiredErrorMessage: uiContext.str(stringResKeys.form.isRequiredError)
            },
            findBy: {
                dataType: FieldDataType.Dropdown,
                dataPath: "findBy",
                isRequired: true,
                isRequiredErrorMessage: uiContext.str(stringResKeys.form.isRequiredError)
            },
            locator: {
                dataType: FieldDataType.Text,
                dataPath: "locator",
                isRequired: true,
                isRequiredErrorMessage: uiContext.str(stringResKeys.form.isRequiredError)
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
    const fieldValidator = new FieldValidator(uiContext);
    let focusFieldId = '';

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
    const handleInsertComment = async (index: number) => {
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
        if ($formData.isValid) {
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
</script>

<div class="page-definition-editor p-8">
    <div class="font-semibold text-xl mb-4">{title}</div>
    <Form {formContext}>
        <FormGroup columns={1}>
            <FormGroupColumn>
                <FormTextField
                    name="description"
                    theme={uiTheme.inlineTextField}
                    on:input={dispatchChange}
                    displayLabel={false}
                    placeholder={uiContext.str(stringResKeys.pageDefinitionEditor.description)}
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
            <ListTableHeaderCell type={ListTableCellType.First} class="text-left w-3/12">
                {uiContext.str(stringResKeys.pageDefinitionEditor.elementName)}
            </ListTableHeaderCell>
            <ListTableHeaderCell type={ListTableCellType.Normal} class="text-left w-2/12">
                {uiContext.str(stringResKeys.pageDefinitionEditor.findBy)}
            </ListTableHeaderCell>
            <ListTableHeaderCell type={ListTableCellType.Normal} class="text-left w-3/12">
                {uiContext.str(stringResKeys.pageDefinitionEditor.locator)}
            </ListTableHeaderCell>
            <ListTableHeaderCell type={ListTableCellType.Last} class="text-left w-3/12">
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
                                focus={`${formContext.formName}_${index}_name_input` === focusFieldId}
                                errorMessage={fieldValidator.validateField('name', item.name, listDef.fields['name'], item) ?? ''}
                            />
                        </ListTableBodyCell>
                        <ListTableBodyCell type={ListTableCellType.Normal}>
                            <FancyDropdownField
                                name={`${formContext.formName}_${index}_findBy`}
                                value={item.findBy}
                                options={locatorTypeOptions}
                                on:change={(event) => handleItemChange(index, "findBy", event.detail.value)}
                                errorMessage={fieldValidator.validateField('findBy', item.findBy, listDef.fields['findBy'], item) ?? ''}
                            />
                        </ListTableBodyCell>
                        <ListTableBodyCell type={ListTableCellType.Normal}>
                            <TextField
                                name={`${formContext.formName}_${index}_locator`}
                                value={item.locator}
                                on:input={(event) => handleItemChange(index, "locator", event.detail.value)}
                                errorMessage={fieldValidator.validateField('locator', item.locator, listDef.fields['locator'], item) ?? ''}
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

    <div class="flex items-center gap-x-2">
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
    <div slot="content">{uiContext.str(stringResKeys.pageDefinitionEditor.deleteRowConfirmation)}</div>
</AlertDialog>
