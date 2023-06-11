<script lang="ts">
  import { combinePath, toTreePath } from "$lib/components/FileExplorer/Node";
  import PrimaryButton from "$lib/components/PrimaryButton.svelte";
  import StandardButton from "$lib/components/StandardButton.svelte";
  import { appContextKey, type IAppContext } from "$lib/context/AppContext";
  import { stringResKeys } from "$lib/context/StringResKeys";
  import { uiContextKey, type IUiContext } from "$lib/context/UiContext";
  import { StandardFolder } from "rockmelonqa.common";
  import { getContext, } from "svelte";

  let uiContext = getContext(uiContextKey) as IUiContext;
  let appContext = getContext(appContextKey) as IAppContext;
  let { state: appState } = appContext;

  /** Toggle on dialog */
  export let showDialog: boolean = false;

  export let testCaseFilePaths: string[];
  export let testRoutineFilePaths: string[];

  $: testCasesFolderPath = combinePath(
    [$appState.projectFile?.folderPath ?? '', StandardFolder.TestCases],
    uiContext.pathSeparator
  );
  $: testCaseRelPaths = testCaseFilePaths.map((testCaseFilePath) => {
    return toTreePath(
      testCaseFilePath, 
      testCasesFolderPath,
      uiContext.pathSeparator);
  });

  $: testRoutinesFolderPath = combinePath(
    [$appState.projectFile?.folderPath ?? '', StandardFolder.TestRoutines],
    uiContext.pathSeparator
  );
  $: testRoutineRelPaths = testRoutineFilePaths.map((testRoutineFilePath) => {
    return toTreePath(
      testRoutineFilePath, 
      testRoutinesFolderPath,
      uiContext.pathSeparator);
  });

  const handleCancelClick = () => {
    showDialog = false;
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
                        {uiContext.str(stringResKeys.deletePageWarningDialog.dialogTitle)}
                    </div>
                    <div class="modal-content mb-8 flex flex-col gap-y-4">
                        {#if testCaseRelPaths.length > 0 || testRoutineRelPaths.length > 0}
                            <div>
                                {uiContext.str(stringResKeys.deletePageWarningDialog.dialogContent)}
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
