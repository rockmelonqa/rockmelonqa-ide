<script lang="ts">
    import { combinePath, toTreePath } from "$lib/components/FileExplorer/Node";
    import PrimaryButton from "$lib/components/PrimaryButton.svelte";
    import StandardButton from "$lib/components/StandardButton.svelte";
    import { appContextKey, type IAppContext } from "$lib/context/AppContext";
    import { stringResKeys } from "$lib/context/StringResKeys";
    import { uiContextKey, type IUiContext } from "$lib/context/UiContext";
    import { StandardFolder, type ITestSuite, type ITestCase } from "rockmelonqa.common";
    import { createEventDispatcher, getContext, onDestroy, onMount } from "svelte";
    import { fileSystem } from "$lib/ipc";

    let uiContext = getContext(uiContextKey) as IUiContext;
    let appContext = getContext(appContextKey) as IAppContext;
    let { state: appState } = appContext;

    /** Toggle on dialog */
    export let showDialog: boolean = false;

    export let testCaseFilePath: string = "";

    export let suiteFilePaths: string[];

    $: suitesFolderPath = combinePath(
        [$appState.projectFile?.folderPath ?? "", StandardFolder.TestSuites],
        uiContext.pathSeparator
    );
    $: suiteRelPaths = suiteFilePaths.map((suiteFilePath) => {
        return toTreePath(suiteFilePath, suitesFolderPath, uiContext.pathSeparator);
    });

    const dispatch = createEventDispatcher();

    const handleDeleteClick = async () => {
        await removeTestCaseFromTestSuites();

        dispatch("deleteConfirmed");
        showDialog = false;
    };
    const handleCancelClick = () => {
        showDialog = false;
    };

    const removeTestCaseFromTestSuites = async () => {
        const fileContent = await fileSystem.readFile(testCaseFilePath);
        if (!fileContent) {
            return;
        }

        const testCase = JSON.parse(fileContent) as ITestCase;
        for (let suiteFilePath of suiteFilePaths) {
            const fileContent = await fileSystem.readFile(suiteFilePath);
            if (fileContent) {
                const testSuite = JSON.parse(fileContent) as ITestSuite;
                testSuite.testcases.splice(testSuite.testcases.indexOf(testCase.id), 1);
                await fileSystem.writeFile(suiteFilePath, JSON.stringify(testSuite, null, 4));
            }
        }
    };
</script>

{#if showDialog}
    <div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="fixed inset-0 bg-gray-400 bg-opacity-75 transition-opacity" />
        <div class="fixed inset-0 overflow-y-auto z-30">
            <div class="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
                <div
                    class="modal-panel relative bg-white rounded-lg p-4 sm:p-6
                    text-left shadow-xl transform transition-all max-w-xl w-full"
                >
                    <div class="modal-title text-xl leading-6 font-bold mb-8">
                        {uiContext.str(stringResKeys.deleteTestCaseConfirmationDialog.dialogTitle)}
                    </div>
                    <div class="modal-content mb-8 flex flex-col gap-y-4">
                        {#if suiteRelPaths.length}
                            <div>
                                {uiContext.str(stringResKeys.deleteTestCaseConfirmationDialog.dialogContent)}
                            </div>
                            <ul class="list-disc list-inside">
                                {#each suiteRelPaths as relatedSuite}
                                    <li>{relatedSuite}</li>
                                {/each}
                            </ul>
                        {/if}
                    </div>
                    <div class="modal-buttons flex justify-start items-end gap-x-4">
                        <div class="ml-auto">
                            <PrimaryButton
                                label={uiContext.str(stringResKeys.general.delete)}
                                class="mr-4"
                                on:click={handleDeleteClick}
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
