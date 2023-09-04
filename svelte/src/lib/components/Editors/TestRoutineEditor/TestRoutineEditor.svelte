<script lang="ts">
    import { stringResKeys } from "$lib/context/StringResKeys";
    import { uiContextKey, type IUiContext } from "$lib/context/UiContext";
    import type { IUiTheme } from "$lib/context/UiTheme";
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
    import { fileSystem } from "$lib/ipc";
    import { fileDefFactory, type ITestRoutine } from "rockmelonqa.common";
    import { createEventDispatcher, getContext, onMount } from "svelte";
    import { appActionContextKey, type IAppActionContext } from "../../Application";
    import { combinePath } from "../../FileExplorer/Node";
    import { toTitle } from "../Editor";
    import TestRoutineDataSet from "./TestRoutineDataSet.svelte";
    import TestRoutineSteps from "./TestRoutineSteps.svelte";

    export let folderPath: string;
    export let fileName: string;
    $: filePath = combinePath([folderPath, fileName], uiContext.pathSeparator);

    export let contentIndex: number;

    const uiContext = getContext(uiContextKey) as IUiContext;
    const { theme } = uiContext;
    const uiTheme = $theme as IUiTheme;

    const dispatch = createEventDispatcher();
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
    let formContext = createFormContext("testRoutineEditor", formDef, uiContext, FormModeState.Edit);
    let {
        mode: formMode,
        modeDispatch: formModeDispatch,
        data: formData,
        dataDispatch: formDataDispatch,
    } = formContext;

    const listStepDef: IListDef = {
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
            comment: {
                dataType: FieldDataType.Text,
                dataPath: "comment",
            },
        },
    };
    let listStepContext = createListDataContext(listStepDef, uiContext);
    let { value: listStep, dispatch: listStepDispatch } = listStepContext;

    const listDataSetDef: IListDef = {
        fields: {
            id: {
                dataType: FieldDataType.Text,
                dataPath: "id",
            },
            name: {
                dataType: FieldDataType.Text,
                dataPath: "name",
            },
            description: {
                dataType: FieldDataType.Text,
                dataPath: "description",
            },
        },
    };
    let listDataSetContext = createListDataContext(listDataSetDef, uiContext);
    let { value: listDataSet, dispatch: listDataSetDispatch } = listDataSetContext;

    const { registerOnSaveHandler, unregisterOnSaveHandler } = getContext(appActionContextKey) as IAppActionContext;
    $: title = toTitle(fileName);

    type tabButton = "btnDataSets" | "btnSteps";
    let activeBtn: tabButton = "btnSteps";
    let loadedDataSets = false;

    onMount(async () => {
        // default/empty data
        let model: ITestRoutine = fileDefFactory.newTestRoutine();

        // parse file content if any
        const fileContent = await fileSystem.readFile(filePath);
        if (fileContent) {
            model = JSON.parse(fileContent) as ITestRoutine;
        }

        const serializer = new FormSerializer(uiContext);
        const fieldValues = serializer.deserialize(model, formDef.fields);
        formDataDispatch({ type: FormDataActionType.Load, newValues: fieldValues });

        /** Reformat step's data
         ** from (file)
         * data: {
         *   "guid-1": "value-1",
         *   "guid-2": "value-2",
         * }
         ** to (form def)
         * data: [
         *   { id: "guid-1", value: "value-1" },
         *   { id: "guid-2", value: "value-2" },
         * ]
         * */
        const steps = model.steps.map((step) => {
            if (step.type === "comment") {
                return { ...step };
            }

            return {
                ...step,
                data: step.data
                    ? (Object.entries(step.data).map(([id, value]) => ({ id, value })) as IDictionary[])
                    : undefined,
            };
        });
        listStepDispatch({ type: ListDataActionType.SetItems, items: steps, hasMoreItems: false });

        const dataSets = serializer.deserializeList(model.dataSets, listDataSetDef.fields);
        listDataSetDispatch({ type: ListDataActionType.SetItems, items: dataSets, hasMoreItems: false });
        loadedDataSets = true;

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

            const stepItems = $listStep.items.filter((r) => !isEmptyStepItem(r));
            /** Reformat step's data
             ** from (form def)
             * data: [
             *   { id: "guid-1", value: "value-1" },
             *   { id: "guid-2", value: "value-2" },
             * ]
             ** to (form file)
             * data: {
             *   "guid-1": "value-1",
             *   "guid-2": "value-2",
             * }
             * */
            const steps = stepItems.map((step) => {
                // do not proceed 'Comment' rows which do not have 'data'
                if (step.data) {
                    const data = step.data.reduce((obj: IDictionary, item: any) => {
                        obj[item.id] = item.value ?? "";
                        return obj;
                    }, {});
                    return { ...step, data };
                } else {
                    return step;
                }
            });

            const dataSets = serializer.serializeList($listDataSet.items, listDataSetDef.fields);

            const data = { ...model, steps, dataSets };
            await fileSystem.writeFile(filePath, JSON.stringify(data, null, 4));

            dispatch("saved");
            return true;
        }

        formDataDispatch({ type: FormDataActionType.ShowAllErrors });
        return false;
    };

    const isEmptyStepItem = (item: IDictionary) => {
        const ignoredProperties: string[] = ["id", "type"];
        return !Object.entries(item)
            .filter(([key, value]) => !ignoredProperties.includes(key))
            .some(([key, value]) => (key === "data" ? value.some((x: any) => x.value) : value));
    };

    const dispatchChange = () => {
        dispatch("change");
    };

    const handleDataSetChange = (e: any) => {
        const { changeScheme } = e.detail;
        if (changeScheme) {
            updateStepData();
        }

        dispatchChange();
    };

    /**
     * Update step's data when:
     * - new structure change from data set (add, remove, change order)
     */
    const updateStepData = () => {
        const steps = [...$listStep.items];
        steps.forEach((step) => {
            step.data = $listDataSet.items.map((ds) => ({
                id: ds.id,
                value: step.data.find((x: IDictionary) => x.id === ds.id)?.value ?? "",
            }));
        });

        listStepDispatch({
            type: ListDataActionType.SetItems,
            items: steps,
            hasMoreItems: false,
        });
    };
</script>

<div class="flex-1 test-routine-editor p-8 pb-0 flex flex-col">
    <div class="font-semibold text-xl mb-4 flex-grow-0">{title}</div>
    <Form {formContext} class="flex-grow-0">
        <FormGroup columns={1}>
            <FormGroupColumn>
                <FormTextField
                    name="description"
                    theme={uiTheme.inlineTextField}
                    on:input={dispatchChange}
                    displayLabel={false}
                    placeholder={uiContext.str(stringResKeys.testRoutineEditor.description)}
                />
            </FormGroupColumn>
        </FormGroup>
    </Form>

    <div class="mb-8 flex flex-grow-0">
        <button
            class={`tab-switcher px-6 py-4 ${activeBtn === "btnSteps" ? "active" : ""}`}
            on:click={() => (activeBtn = "btnSteps")}
        >
            {uiContext.str(stringResKeys.testRoutineEditor.steps)}
        </button>
        <button
            class={`tab-switcher px-6 py-4 ${activeBtn === "btnDataSets" ? "active" : ""}`}
            on:click={() => (activeBtn = "btnDataSets")}
        >
            {uiContext.str(stringResKeys.testRoutineEditor.dataSet)}
        </button>
    </div>

    {#if activeBtn === "btnDataSets"}
        <TestRoutineDataSet {formContext} {listDataSetContext} on:change={handleDataSetChange} on:save={handleSave} />
    {:else if activeBtn === "btnSteps"}
        {#if loadedDataSets}
            <TestRoutineSteps
                {formContext}
                {listStepContext}
                dataSetItems={$listDataSet.items}
                on:change={dispatchChange}
                on:save={handleSave}
            />
        {/if}
    {/if}
</div>

<style>
    .tab-switcher {
        border: 1px solid var(--color-panel-border);
    }

    .tab-switcher.active,
    .tab-switcher:hover {
        background-color: var(--color-highlight--bright);
    }

    :global(.tab-switcher + .tab-switcher) {
        margin-left: -1px;
    }

    .tab-switcher:first-child {
        border-top-left-radius: 0.375rem;
        border-bottom-left-radius: 0.375rem;
    }

    .tab-switcher:last-child {
        border-top-right-radius: 0.375rem;
        border-bottom-right-radius: 0.375rem;
    }
</style>
