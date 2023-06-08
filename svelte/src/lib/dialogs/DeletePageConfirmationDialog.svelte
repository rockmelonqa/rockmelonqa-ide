<script lang="ts">
  import { combinePath, toTreePath } from "$lib/components/FileExplorer/Node";
  import PrimaryButton from "$lib/components/PrimaryButton.svelte";
  import StandardButton from "$lib/components/StandardButton.svelte";
  import { appContextKey, type IAppContext } from "$lib/context/AppContext";
  import { stringResKeys } from "$lib/context/StringResKeys";
  import { uiContextKey, type IUiContext } from "$lib/context/UiContext";
  import { StandardFolder, type ITestSuite, type ITestCase, type ITestRoutine } from "rockmelonqa.common";
  import { createEventDispatcher, getContext, onDestroy, onMount } from "svelte";
  import { fileSystem } from "$lib/ipc";
    import type { IPage } from "rockmelonqa.common/file-defs/pageFile";

  let uiContext = getContext(uiContextKey) as IUiContext;
  let appContext = getContext(appContextKey) as IAppContext;
  let { state: appState } = appContext;

  /** Toggle on dialog */
  export let showDialog: boolean = false;

  export let pageFilePath: string = '';

  export let testCaseFilePaths: string[];
  export let testRoutineFilePaths: string[];

  $: testCaseRelPaths = testCaseFilePaths.map((testCaseFilePath) => {
    return toTreePath(
      testCaseFilePath, 
      combinePath([$appState.projectFile?.folderPath ?? '', StandardFolder.TestCases], uiContext.pathSeparator), 
      uiContext.pathSeparator);
  });
  $: testRoutineRelPaths = testRoutineFilePaths.map((testRoutineFilePath) => {
    return toTreePath(
      testRoutineFilePath, 
      combinePath([$appState.projectFile?.folderPath ?? '', StandardFolder.TestRoutines], uiContext.pathSeparator), 
      uiContext.pathSeparator);
  });

  const dispatch = createEventDispatcher();

  const handleDeleteClick = async () => {
    const fileContent = await fileSystem.readFile(pageFilePath);
    if (fileContent) {
      const page = JSON.parse(fileContent) as IPage;    
      await removePageFromTestCases(page.id);
      await removePageFromTestRoutines(page.id);
    }

    dispatch("deleteConfirmed");
    showDialog = false;
  };
  const handleCancelClick = () => {
    showDialog = false;
  };

  const removePageFromTestCases = async (pageId: string) => {
    for (let testCaseFilePath of testCaseFilePaths) {
      const fileContent = await fileSystem.readFile(testCaseFilePath);
      if (fileContent) {
        const testCase = JSON.parse(fileContent) as ITestCase;
        testCase.steps = testCase.steps.filter((s) => !(s.type === 'testStep' && s.page === pageId))
        await fileSystem.writeFile(testCaseFilePath, JSON.stringify(testCase, null, 4));
      }
    }
  };
  const removePageFromTestRoutines = async (pageId: string) => {
    for (let testRoutineFilePath of testRoutineFilePaths) {
      const fileContent = await fileSystem.readFile(testRoutineFilePath);
      if (fileContent) {
        const testRoutine = JSON.parse(fileContent) as ITestRoutine;
        testRoutine.steps = testRoutine.steps.filter((s) => !(s.type === 'testStep' && s.page === pageId))
        await fileSystem.writeFile(testRoutineFilePath, JSON.stringify(testRoutine, null, 4));
      }
    }
  };
</script>

{#if showDialog}
    <div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="fixed inset-0 bg-gray-400 bg-opacity-75 transition-opacity" />
        <div class="fixed inset-0 overflow-y-auto">
            <div class="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
                <div
                    class="modal-panel relative bg-white rounded-lg p-4 sm:p-6
                    text-left shadow-xl transform transition-all max-w-xl w-full"
                >
                    <div class="modal-title text-xl leading-6 font-bold mb-8">
                        {uiContext.str(stringResKeys.deletePageConfirmationDialog.dialogTitle)}
                    </div>
                    <div class="modal-content mb-8 flex flex-col gap-y-4">
                        {#if testCaseRelPaths.length > 0 || testRoutineRelPaths.length > 0}
                            <div>
                                {uiContext.str(stringResKeys.deletePageConfirmationDialog.dialogContent)}
                            </div>
                            <ul class="list-disc list-inside">
                                {#each testCaseRelPaths as path}
                                    <li>{path}</li>
                                {/each}
                            </ul>
                            <ul class="list-disc list-inside">
                              {#each testRoutineRelPaths as path}
                                  <li>{path}</li>
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

<style>
    :global(.modal-title) {
        color: var(--color-brand);
    }
</style>
