<script lang="ts">
    import { stringResKeys } from "$lib/context/StringResKeys";
    import { uiContextKey, type IUiContext } from "$lib/context/UiContext";
    import TextField from "$lib/controls/TextField.svelte";
    import { FieldDataType, type IDictionary } from "$lib/form/FieldDef";
    import { createFormContext } from "$lib/form/FormContext";
    import { FormDataActionType } from "$lib/form/FormData";
    import type { IFormDef } from "$lib/form/FormDef";
    import { FormModeState } from "$lib/form/FormMode";
    import { FormSerializer } from "$lib/form/FormSerializer";
    import { ListDataActionType, createListDataContext } from "$lib/form/ListData";
    import type { IListDef } from "$lib/form/ListDef";
    import AddIcon from "$lib/icons/AddIcon.svelte";
    import DeleteIcon from "$lib/icons/DeleteIcon.svelte";
    import SaveIcon from "$lib/icons/SaveIcon.svelte";
    import { fileSystem } from "$lib/ipc";
    import { fileDefFactory, type IEnvironmentContent, type ISetting } from "rockmelonqa.common";
    import { createEventDispatcher, getContext, onMount } from "svelte";
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

    export let folderPath: string;
    export let fileName: string;
    export let contentIndex: number;

    const formDef: IFormDef = {
        fields: {},
    };

    let formContext = createFormContext("envEditor", formDef, uiContext, FormModeState.Edit);
    let {
        mode: formMode,
        modeDispatch: formModeDispatch,
        data: formData,
        dataDispatch: formDataDispatch,
    } = formContext;

    const listDef: IListDef = {
        fields: {
            name: {
                dataType: FieldDataType.Text,
                dataPath: "name",
            },
            value: {
                dataType: FieldDataType.Text,
                dataPath: "value",
            },
        },
    };
    let listDataContext = createListDataContext(listDef, uiContext);
    let { value: listData, dispatch: listDataDispatch } = listDataContext;

    $: filePath = combinePath([folderPath, fileName], uiContext.pathSeparator);
    $: title = toTitle(fileName);

    let deleteDialogType: AlertDialogType = AlertDialogType.None;
    let indexToDelete: number;

    const { registerOnSaveHandler, unregisterOnSaveHandler } = getContext(appActionContextKey) as IAppActionContext;
    const dispatch = createEventDispatcher();

    onMount(async () => {
        // default/empty data
        let model = fileDefFactory.newEnvironmentSettings();

        // parse file content if any
        const fileContent = await fileSystem.readFile(filePath);
        if (fileContent) {
            model = JSON.parse(fileContent) as IEnvironmentContent;
        }

        const serializer = new FormSerializer(uiContext);
        const fieldValues = serializer.deserialize(model, formDef.fields);
        formDataDispatch({ type: FormDataActionType.Load, newValues: fieldValues });

        const items = serializer.deserializeList(model.settings, listDef.fields);
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

    const handleAdd = () => {
        listDataDispatch({
            type: ListDataActionType.AppendItems,
            items: [newConfig()],
            hasMoreItems: false,
        });

        dispatchChange();
    };

    const newConfig = (): ISetting => {
        return {
            name: "",
            value: "",
        };
    };

    const handleSave = async () => {
        await doSave();
    };

    const doSave = async (): Promise<boolean> => {
        if (isDataValid) {
            const serializer = new FormSerializer(uiContext);
            const model = serializer.serialize($formData.values, formDef.fields);

            const items = $listData.items.filter((r) => !isEmptyItem(r));
            const settings = serializer.serializeList(items, listDef.fields);

            const data = { ...model, settings };
            await fileSystem.writeFile(filePath, JSON.stringify(data, null, 4));

            dispatch("saved");
            return true;
        }

        formDataDispatch({ type: FormDataActionType.ShowAllErrors });
        return false;
    };

    const validateName = (name: string): string => {
        if (!name?.trim()) {
            return uiContext.str(stringResKeys.form.isRequiredError);
        }

        const regex = /^[A-Za-z0-9_-]+$/;
        if (!regex.test(name)) {
            return uiContext.str(stringResKeys.environmentEditor.invalidNameMessage);
        }

        return ""; // no error message == valid
    };
    $: isListDataValid = $listData.items.every((item) => !validateName(item.name));
    $: isDataValid = $formData.isValid && isListDataValid;

    const getDefaultPlaceholder = (varName: string): string => {
        switch (varName) {
            case "TakeScreenshotOnError":
                return "true/false";
            case "RecordVideoMode":
                return "On/Off/RetainOnFailure";
            default:
                return "";
        }
    };

    const gridConfig: GridConfig = {
        gridType: "EnvironmentEditor",
        columns: [
            {
                size: 30,
                title: uiContext.str(stringResKeys.environmentEditor.name),
            },
            {
                size: 60,
                title: uiContext.str(stringResKeys.environmentEditor.value),
            },
            {
                size: 10,
                title: uiContext.str(stringResKeys.environmentEditor.actions),
            },
        ],
    };

    const getActionButtons = (index: number): ButtonOptions[] => {
        return [
            {
                label: uiContext.str(stringResKeys.general.delete),
                icon: DeleteIcon,
                action: handleDeleteClick,
                visible: true,
            },
        ];
    };
</script>

<div class="flex-1 environment-editor p-8 pb-0 flex flex-col">
    <div class="font-semibold text-xl mb-4 flex-grow-0">{title}</div>

    <div class="flex-1 min-h-0 flex flex-col pb-0">
        <DynamicGrid config={gridConfig} items={$listData.items}>
            <svelte:fragment slot="item" let:item let:index>
                <DynamicCell>
                    <TextField
                        name={`${formContext.formName}_${index}_name`}
                        value={item.name}
                        on:input={(event) => handleItemChange(index, "name", event.detail.value)}
                        errorMessage={validateName(item.name)}
                    />
                </DynamicCell>
                <DynamicCell>
                    <TextField
                        name={`${formContext.formName}_${index}_value`}
                        value={item.value}
                        placeholder={getDefaultPlaceholder(item.name)}
                        on:input={(event) => handleItemChange(index, "value", event.detail.value)}
                    />
                </DynamicCell>
                <DynamicCell class="text-center" allowHighlight={false}>
                    <ActionsMenu {index} buttons={getActionButtons(index)} />
                </DynamicCell>
            </svelte:fragment>
        </DynamicGrid>
    </div>

    <div class="flex items-center flex-grow-0 py-4">
        <IconLinkButton on:click={handleAdd}>
            <svelte:fragment slot="icon"><AddIcon /></svelte:fragment>
            <svelte:fragment slot="label">
                {uiContext.str(stringResKeys.general.add)}
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
    <div slot="content">{uiContext.str(stringResKeys.environmentEditor.deleteRowConfirmation)}</div>
</AlertDialog>
