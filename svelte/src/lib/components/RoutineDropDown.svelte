<!--
    Clone from 'controls/TextField.svelte'
-->
<script lang="ts">
    import { appContextKey, type IAppContext } from "$lib/context/AppContext";
    import { uiContextKey, type IUiContext } from "$lib/context/UiContext";
    import type { IUiTheme } from "$lib/context/UiTheme";
    import type { IDropdownOption } from "$lib/controls/DropdownField";
    import FancyDropdownField from "$lib/controls/FancyDropdownField.svelte";
    import { fileSystem } from "$lib/ipc";
    import type { ITestRoutine } from "rockmelonqa.common";
    import { createEventDispatcher, getContext, onMount } from "svelte";
    import { derived } from "svelte/store";

    const dispatch = createEventDispatcher();

    //*****************************************
    // Props
    //*****************************************
    export let name: string;
    export let routine: string;
    export let dataset: string;

    //*****************************************
    // Init
    //*****************************************

    const uiContext = getContext(uiContextKey) as IUiContext;

    let appContext = getContext(appContextKey) as IAppContext;
    let { state: appState, dispatch: appStateDispatch } = appContext;

    let { theme } = uiContext;
    let thisTheme = ($theme as IUiTheme).textField ?? {};

    let rootId = `${name}_root`;
    let isFocus = false;

    let testRoutineOptions: IDropdownOption[] = [];
    let datasetOptions: IDropdownOption[] = [];

    const testRoutinesSubscription = derived(appState, ($appState) => $appState.testRoutines);
    testRoutinesSubscription.subscribe((testRoutine) => {
        testRoutineOptions = Array.from(testRoutine.entries())
            .map(([key, { name }]) => ({ key, text: name } as IDropdownOption))
            .sort((a, b) => a.text.localeCompare(b.text));
    });

    onMount(async () => {
        if (routine) {
            await loadDataSetDropDown(routine);
        }
    });

    const loadDataSetDropDown = async (routineId: string) => {
        const routineFile = $appState.testRoutines.get(routineId);
        const fileContent = await fileSystem.readFile(routineFile!.filePath);
        if (!fileContent) {
            return;
        }

        const routineData = JSON.parse(fileContent) as ITestRoutine;
        datasetOptions = routineData.dataSets.map((ds) => ({ key: ds.id, text: ds.name }));
    };

    //*****************************************
    // Events
    //*****************************************
    const handleSelectRoutine = async (e: any) => {
        const routineId = e.detail.value;
        await loadDataSetDropDown(routineId);
        dispatch("selectRoutine", { value: routineId });
        dataset = "";
    };
    const handleSelectDataset = (e: any) => {
        dispatch("selectDataset", { value: e.detail.value });
    };
</script>

<div id={rootId} class="text-field-root {thisTheme.root}">
    <div class="text-field-input-container {thisTheme?.inputContainer}">
        <div class="flex">
            <button
                type="button"
                class={`bg-slate-100 cursor-default px-6 py-3 
                    border ${isFocus ? "border-indigo-500" : "border-slate-300"} font-bold rounded-l-md shadow-sm`}
                {...$$restProps}
            >
                <span>Routine</span>
            </button>

            <div class="flex-1 flex ps-3 gap-6">
                <div class="flex-1">
                    <FancyDropdownField
                        name={name + "_id"}
                        value={routine}
                        options={testRoutineOptions}
                        on:change={handleSelectRoutine}
                    />
                </div>
                <div class="flex-1">
                    <FancyDropdownField
                        name={name + "_dataset"}
                        value={dataset}
                        options={datasetOptions}
                        on:change={handleSelectDataset}
                    />
                </div>
            </div>
        </div>
    </div>
</div>

<style>
</style>
