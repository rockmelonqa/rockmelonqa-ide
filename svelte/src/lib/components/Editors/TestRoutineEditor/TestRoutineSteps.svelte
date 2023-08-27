<script lang="ts">
    import { AlertDialogButtons, AlertDialogType } from "$lib/components/Alert";
    import AlertDialog from "$lib/components/AlertDialog.svelte";
    import IconLinkButton from "$lib/components/IconLinkButton.svelte";
    import { ListTableCellType } from "$lib/components/ListTable";
    import ListTable from "$lib/components/ListTable.svelte";
    import ListTableBodyCell from "$lib/components/ListTableBodyCell.svelte";
    import ListTableBodyRow from "$lib/components/ListTableBodyRow.svelte";
    import ListTableHeaderCell from "$lib/components/ListTableHeaderCell.svelte";
    import PrimaryButton from "$lib/components/PrimaryButton.svelte";
    import { appContextKey, type IAppContext } from "$lib/context/AppContext";
    import { stringResKeys } from "$lib/context/StringResKeys";
    import { uiContextKey, type IUiContext } from "$lib/context/UiContext";
    import type { IDropdownOption } from "$lib/controls/DropdownField";
    import FancyDropdownField from "$lib/controls/FancyDropdownField.svelte";
    import TextField from "$lib/controls/TextField.svelte";
    import type { IDictionary } from "$lib/form/FieldDef";
    import type { IFormContext } from "$lib/form/FormContext";
    import { ListDataActionType, type IListDataContext } from "$lib/form/ListData";
    import AddIcon from "$lib/icons/AddIcon.svelte";
    import CommentIcon from "$lib/icons/CommentIcon.svelte";
    import DeleteIcon from "$lib/icons/DeleteIcon.svelte";
    import MoveDownIcon from "$lib/icons/MoveDownIcon.svelte";
    import MoveUpIcon from "$lib/icons/MoveUpIcon.svelte";
    import SaveIcon from "$lib/icons/SaveIcon.svelte";
    import { getActionTypeDropDownOptions } from "$lib/utils/dropdowns";

    import { createEventDispatcher, getContext } from "svelte";
    import { derived } from "svelte/store";
    import { v4 as uuidv4 } from "uuid";
    import { isPagelessAction } from "../Editor";
    import CommentTextField from "$lib/components/CommentTextField.svelte";
    import { removeFileExtension } from "$lib/utils/utils";
    import type { IRoutineStep } from "rockmelonqa.common/file-defs";
    import type { ButtonOptions, ColumnOptions, GridConfig } from "../DynamicGrid/DynamicGrid";
    import DynamicGrid from "../DynamicGrid/DynamicGrid.svelte";
    import DynamicCell from "../DynamicGrid/DynamicCell.svelte";
    import { _ } from "svelte-i18n";
    import lodash from "lodash";
    import ActionsMenu from "../DynamicGrid/ActionsMenu.svelte";

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

    const isTestStep = (item: IDictionary) => {
        return (item as IRoutineStep).type === "testStep";
    };

    let lastUsedPage: string | undefined = $listStep.items.findLast(
        (item) => isTestStep(item) && !isPagelessAction(item.action)
    )?.page;

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
        item["data"][dataIndex]["value"] = value;

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
        const ignoredProperties: string[] = ["id", "type"];
        return !Object.entries(item)
            .filter(([key, value]) => !ignoredProperties.includes(key))
            .some(([key, value]) => (key === "data" ? value.some((x: any) => x.value) : value));
    };

    const handleDeleteConfirmation = async (event: any) => {
        if (event.detail.button === "delete") {
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
            type: "testStep",
            name: "",
            description: "",
            page: lastUsedPage,
            data: dataSetItems.map((x) => ({
                id: x.id,
                value: "",
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
        return { id: uuidv4(), type: "comment", comment: "" } as IDictionary;
    };

    const isComment = (item: IDictionary) => {
        return (item as IRoutineStep).type === "comment";
    };

    const dispatchChange = () => {
        dispatch("change");
    };

    /** Spread the total into `parts` */
    let spreadInteger = (total: number, parts: number) => {
        let remain = total;
        let current = 0;
        let portions = [];
        for (let i = 0; i < parts; i++) {
            current = Math.round(remain / (parts - i));
            portions.push(current);
            remain -= current;
        }
        return portions;
    };

    let gridConfig: GridConfig;

    $: {
        let columns: ColumnOptions[] = [
            {
                defaultSizePercentage: 20,
                title: uiContext.str(stringResKeys.testRoutineEditor.action),
            },
            {
                defaultSizePercentage: 20,
                title: uiContext.str(stringResKeys.testRoutineEditor.page),
            },
            {
                defaultSizePercentage: 15,
                title: uiContext.str(stringResKeys.testRoutineEditor.element),
            },
        ];

        let remainingPercentage = 85 - lodash.sumBy(columns, (c) => c.defaultSizePercentage);
        let splitPortions = spreadInteger(remainingPercentage, dataSetItems.length);

        for (let [index, item] of dataSetItems.entries()) {
            columns.push({
                defaultSizePercentage: splitPortions[index],
                title: item.name,
            });
        }

        columns.push({
            defaultSizePercentage: 15,
            title: uiContext.str(stringResKeys.testRoutineEditor.actions),
        });

        gridConfig = {
            gridType: "TestRoutineSteps",
            columns,
        };
    }

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
                visible: index < $listStep.items.length - 1,
            },
        ];
    };
</script>

{#if gridConfig}
    <div class="flex-1 overflow-x-auto min-h-0">
        <DynamicGrid config={gridConfig} items={$listStep.items} class="h-full">
            <svelte:fragment slot="item" let:item let:index>
                {#if isComment(item)}
                    <DynamicCell colspan={gridConfig.columns.length * 2 - 2} isLast={true}>
                        <CommentTextField
                            name={`${formName}_${index}_comment`}
                            value={item.comment}
                            placeholder={uiContext.str(stringResKeys.testRoutineEditor.comment)}
                            on:input={(event) => handleItemChange(index, "comment", event.detail.value)}
                        />
                    </DynamicCell>
                {:else}
                    <DynamicCell>
                        <FancyDropdownField
                            name={`${formName}_${index}_action`}
                            value={item.action}
                            options={actionTypeOptions}
                            on:change={(event) => handleItemChange(index, "action", event.detail.value)}
                        />
                    </DynamicCell>
                    <DynamicCell>
                        {#if !isPagelessAction(item.action)}
                            <FancyDropdownField
                                name={`${formName}_${index}_page`}
                                value={item.page}
                                options={pageDefinitionOptions}
                                on:change={(event) => handlePageChange(index, event.detail.value)}
                            />
                        {/if}
                    </DynamicCell>
                    <DynamicCell>
                        {#if !isPagelessAction(item.action)}
                            <FancyDropdownField
                                name={`${formName}_${index}_element`}
                                value={item.element}
                                options={pageElementsMap.get(item.page) ?? []}
                                on:change={(event) => handleItemChange(index, "element", event.detail.value)}
                            />
                        {/if}
                    </DynamicCell>
                    {#each item.data as data, dataIndex}
                        <DynamicCell>
                            <TextField
                                name={`${formName}_${index}_data_${dataIndex}`}
                                value={data.value}
                                on:input={(event) => handleStepDataItemChange(index, dataIndex, event.detail.value)}
                            />
                        </DynamicCell>
                    {/each}
                {/if}

                <DynamicCell>
                    <ActionsMenu {index} buttons={buildActionMenuButtons(index)} />
                </DynamicCell>
            </svelte:fragment>
        </DynamicGrid>
    </div>
{/if}

<div class="py-4 flex items-center justify-between flex-grow-0">
    <div>
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
    </div>

    <div class="">
        <PrimaryButton on:click={() => dispatch("save")}>
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
