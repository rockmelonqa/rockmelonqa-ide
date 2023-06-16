<script lang="ts">
    import PrimaryButton from "$lib/components/PrimaryButton.svelte";
    import StandardButton from "$lib/components/StandardButton.svelte";
    import { appContextKey, type IAppContext } from "$lib/context/AppContext";
    import { stringResKeys } from "$lib/context/StringResKeys";
    import { uiContextKey, type IUiContext } from "$lib/context/UiContext";
    import type { IDropdownOption } from "$lib/controls/DropdownField";
    import FancyDropdownField from "$lib/controls/FancyDropdownField.svelte";
    import { createEventDispatcher, getContext } from "svelte";
    import { derived } from "svelte/store";

    //*****************************************
    // Props
    //*****************************************
    let uiContext = getContext(uiContextKey) as IUiContext;
    let appContext = getContext(appContextKey) as IAppContext;
    let { state: appState } = appContext;

    /** Toggle on dialog */
    export let showDialog: boolean = false;

    export { selectingRoutineId as routine };
    let selectingRoutineId: string = "";

    export { selectingDatasets as datasets };
    let selectingDatasets: string[] = [];

    let routineOptions: IDropdownOption[] = [];
    const testRoutinesSubscription = derived(appState, ($appState) => $appState.testRoutines);
    testRoutinesSubscription.subscribe((testRoutine) => {
        routineOptions = Array.from(testRoutine.entries())
            .map(([key, { name }]) => ({ key, text: name } as IDropdownOption))
            .sort((a, b) => a.text.localeCompare(b.text));
    });

    let datasetOptions: IDropdownOption[] = [];
    $: {
        loadDatasetOptions(selectingRoutineId);
    }

    const dispatch = createEventDispatcher();

    //*****************************************
    // Event handler
    //*****************************************
    const handleCancelClick = () => {
        showDialog = false;
    };

    const handleSaveClick = () => {
        showDialog = false;

        dispatch("submit", { 
            value: { 
                routine: selectingRoutineId, 
                datasets: selectingDatasets 
            } 
        });
    };

    const handleSelectRoutine = (e: any) => {
        selectingRoutineId = e.detail.value;
        selectingDatasets.length = 0;
    };

    const loadDatasetOptions = (selectingRoutineId: string) => {
        const routine = $appState.testRoutines.get(selectingRoutineId);
        datasetOptions.length = 0; // clear old options

        if (routine) {
            for (const [key, value] of routine.datasets) {
                datasetOptions.push({
                    key: key,
                    text: value.name,
                } as IDropdownOption);
            }
        }
    };

    const handleSelectAll = () => {
        selectingDatasets = [...datasetOptions.map((x) => x.key)];
    };

    const handleUnselectAll = () => {
        selectingDatasets = [];
    };

    const handleSelect = (value: string) => {
        selectingDatasets = [...selectingDatasets, value];
    };

    const handleUnselect = (value: string) => {
        selectingDatasets = selectingDatasets.filter((x) => x !== value);
    };
</script>

{#if showDialog}
    <div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="fixed inset-0 bg-gray-400 bg-opacity-75 transition-opacity" />
        <div class="fixed inset-0 overflow-y-auto">
            <div class="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
                <div
                    class="modal-panel relative bg-white rounded-lg p-4 sm:p-6
                      text-left shadow-xl transform transition-all max-w-5xl w-full"
                >
                    <div class="modal-title text-xl leading-6 font-bold mb-8">
                        {uiContext.str(stringResKeys.routinePickerDialog.dialogTitle)}
                    </div>
                    <div class="modal-content mb-8">
                        <FancyDropdownField
                            name="routinePickerDialog_routine"
                            value={selectingRoutineId}
                            options={routineOptions}
                            on:change={handleSelectRoutine}
                            label={uiContext.str(stringResKeys.routinePickerDialog.routine)}
                        />
                        <div class="my-4 block font-semibold text-base">
                            {uiContext.str(stringResKeys.routinePickerDialog.dataset)}
                        </div>
                        <div class="flex gap-x-4">
                            <div class="box flex-1 border relative rounded-md">
                                <div class="absolute top-2 left-2 bg-white px-2 transform -translate-y-full">
                                    <span>{uiContext.str(stringResKeys.routinePickerDialog.availableOptions)}</span>
                                </div>
                                <div class="box-content mt-2 p-4 flex flex-col gap-y-2 overflow-y-auto">
                                    {#each datasetOptions.filter((x) => !selectingDatasets.includes(x.key)) as option (option.key)}
                                        <div class="flex items-center gap-x-2">
                                            <input type="checkbox" on:change={() => handleSelect(option.key)} />
                                            <span class="truncate">{option.text}</span>
                                        </div>
                                    {/each}
                                </div>
                            </div>
                            <div class="flex flex-col justify-center gap-y-4">
                                <StandardButton
                                    label={uiContext.str(stringResKeys.routinePickerDialog.selectAll)}
                                    on:click={handleSelectAll}
                                    disabled={selectingDatasets.length === datasetOptions.length}
                                />
                                <StandardButton
                                    label={uiContext.str(stringResKeys.routinePickerDialog.unselectAll)}
                                    on:click={handleUnselectAll}
                                    disabled={selectingDatasets.length === 0}
                                />
                            </div>
                            <div class="box flex-1 border relative rounded-md">
                                <div class="absolute top-2 left-2 bg-white px-2 transform -translate-y-full">
                                    <span>{uiContext.str(stringResKeys.routinePickerDialog.selectedOptions)}</span>
                                </div>
                                <div class="box-content mt-2 p-4 flex flex-col gap-y-2 overflow-y-auto">
                                    {#each datasetOptions.filter((x) => selectingDatasets.includes(x.key)) as option (option.key)}
                                        <div class="flex items-center gap-x-2">
                                            <input
                                                type="checkbox"
                                                checked={true}
                                                on:change={() => handleUnselect(option.key)}
                                            />
                                            <span class="truncate">{option.text}</span>
                                        </div>
                                    {/each}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-buttons flex justify-start items-end gap-x-4">
                        <div class="ml-auto">
                            <PrimaryButton
                                label={uiContext.str(stringResKeys.general.save)}
                                class="mr-4"
                                on:click={handleSaveClick}
                            />
                            <StandardButton
                                label={uiContext.str(stringResKeys.general.cancel)}
                                on:click={handleCancelClick}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
    .box {
        border-color: var(--color-input-border);
    }

    .box-content {
        height: 20rem;
    }

    input[type="checkbox"] {
        color: var(--color-brand);
        --tw-ring-color: var(--color-brand);
        cursor: pointer;
    }
</style>
