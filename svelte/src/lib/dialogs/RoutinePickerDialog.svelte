<script lang="ts">
    import IconLinkButton from "$lib/components/IconLinkButton.svelte";
    import PrimaryButton from "$lib/components/PrimaryButton.svelte";
    import StandardButton from "$lib/components/StandardButton.svelte";
    import { appContextKey, type IAppContext } from "$lib/context/AppContext";
    import { stringResKeys } from "$lib/context/StringResKeys";
    import { uiContextKey, type IUiContext } from "$lib/context/UiContext";
    import type { IDropdownOption } from "$lib/controls/DropdownField";
    import FancyDropdownField from "$lib/controls/FancyDropdownField.svelte";
    import { getContext } from "svelte";
    import { derived } from "svelte/store";

    //*****************************************
    // Props
    //*****************************************
    let uiContext = getContext(uiContextKey) as IUiContext;
    let appContext = getContext(appContextKey) as IAppContext;
    let { state: appState } = appContext;

    /** Toggle on dialog */
    export let showDialog: boolean = false;

    export let routineId: string = "";
    export let datasets: string[] = [];

    let routineOptions: IDropdownOption[] = [];
    const testRoutinesSubscription = derived(appState, ($appState) => $appState.testRoutines);
    testRoutinesSubscription.subscribe((testRoutine) => {
        routineOptions = Array.from(testRoutine.entries())
            .map(([key, { name }]) => ({ key, text: name } as IDropdownOption))
            .sort((a, b) => a.text.localeCompare(b.text));
    });

    let datasetOptions: IDropdownOption[] = [];
    $: {
        loadDatasetOptions(routineId);
    }

    //*****************************************
    // Event handler
    //*****************************************
    const handleCancelClick = () => {
        showDialog = false;
    };

    const handleSaveClick = () => {
        showDialog = false;
    };

    const handleSelectRoutine = (e: any) => {
        // update selecting routine id
        routineId = e.detail.value;

        // clear selected datasets
        datasets.length = 0;
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
        console.log('select-all');
    };

    const handleUnselectAll = () => {
        console.log('unselect-all');
    };

    const handleSelect = (value: string) => {

    };

    const handleUnselect = (value: string) => {

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
                            value={routineId}
                            options={routineOptions}
                            on:change={handleSelectRoutine}
                            label={uiContext.str(stringResKeys.routinePickerDialog.routine)}
                        />
                        <div class="my-4 block font-semibold text-base">
                            {uiContext.str(stringResKeys.routinePickerDialog.dataset)}
                        </div>
                        <div class="flex gap-x-4">
                            <div class="box w-1/2 border relative rounded-md">
                                <div class="absolute top-2 left-2 bg-white px-2 transform -translate-y-full 
                                    flex items-center gap-x-4">
                                    <span>{uiContext.str(stringResKeys.routinePickerDialog.availableOptions)}</span>
                                    <IconLinkButton on:click={handleSelectAll}>
                                        <svelte:fragment slot="label">
                                            {uiContext.str(stringResKeys.routinePickerDialog.selectAll)}
                                        </svelte:fragment>
                                    </IconLinkButton>
                                </div>
                                <div class="mt-2 p-4 flex flex-col gap-y-2">
                                    {#each datasetOptions as option (option.key)}
                                        <div class="flex items-center gap-x-2">
                                            <input type="checkbox" on:change={() => handleSelect(option.key)}/>
                                            <span>{option.text}</span>
                                        </div>
                                    {/each}
                                </div>
                            </div>
                            <div class="box w-1/2 border relative rounded-md">
                                <div class="absolute top-2 right-2 bg-white px-2 transform -translate-y-full text-right
                                    flex items-center gap-x-4">
                                    <IconLinkButton on:click={handleUnselectAll}>
                                        <svelte:fragment slot="label">
                                            {uiContext.str(stringResKeys.routinePickerDialog.unselectAll)}
                                        </svelte:fragment>
                                    </IconLinkButton>
                                    <span>{uiContext.str(stringResKeys.routinePickerDialog.selectedOption)}</span>
                                </div>
                                <div class="mt-2 p-4 flex flex-col gap-y-2">
                                    {#each datasetOptions as option (option.key)}
                                        <div class="flex items-center gap-x-2">
                                            <input type="checkbox" checked={true} on:change={() => handleUnselect(option.key)}/>
                                            <span>{option.text}</span>
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

    .icon {
        color: var(--color-brand);
    }
</style>
