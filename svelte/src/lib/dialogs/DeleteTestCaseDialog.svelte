<script lang="ts">
  import { combinePath } from "$lib/components/FileExplorer/Node";
  import { Notify } from "$lib/components/Notify";
  import PrimaryButton from "$lib/components/PrimaryButton.svelte";
  import StandardButton from "$lib/components/StandardButton.svelte";
  import { AppActionType, appContextKey, type IAppContext } from "$lib/context/AppContext";
  import { stringResKeys } from "$lib/context/StringResKeys";
  import { uiContextKey, type IUiContext } from "$lib/context/UiContext";
  import { fileSystem } from "$lib/ipc";
  import { StandardFolder, type ITestCase, type ITestSuite } from "rockmelonqa.common/file-defs";
  import { getContext, onDestroy, onMount } from "svelte";

  /** Toggle on dialog */
  export let showDialog: boolean = false;
  /** File system physical path */
  export let testCaseFilePath: string;
  /** Path on tree (used for closing coresponding tab after deleting testcase node) */
  export let nodePath: string;
  /** Array of relative paths of the test suites that contains the test case being deleted */
  export let relatedTestSuiteRelPaths: string[] = [];

  let uiContext = getContext(uiContextKey) as IUiContext;
  let appContext = getContext(appContextKey) as IAppContext;
  let { state: appState, dispatch: appStateDispatch } = appContext;

  onMount(async () => {});

  onDestroy(() => {});

  const getTestCaseId = async () => {
    let testCaseId: string = "";

    const fileContent = await fileSystem.readFile(testCaseFilePath);
    if (fileContent) {
      const testCase = JSON.parse(fileContent) as ITestCase;
      testCaseId = testCase.id;
    }

    return testCaseId;
  };

  const getTestSuiteFilePaths = () => {
    const relatedSuiteFilePaths = relatedTestSuiteRelPaths.map((relPath) => {
      const suiteFilePath = combinePath(
        [
          $appState.projectFile!.folderPath,
          StandardFolder.TestSuites,
          relPath.replaceAll("/", uiContext.pathSeparator),
        ],
        uiContext.pathSeparator
      );
      return suiteFilePath;
    });

    return relatedSuiteFilePaths;
  };

  const removeTestCaseFromTestSuites = async (testCaseId: string, relatedSuiteFilePaths: string[]) => {
    for (let relatedSuiteFilePath of relatedSuiteFilePaths) {
      const fileContent = await fileSystem.readFile(relatedSuiteFilePath);
      if (fileContent) {
        const testSuite = JSON.parse(fileContent) as ITestSuite;
        testSuite.testcases.splice(testSuite.testcases.indexOf(testCaseId), 1);
        await fileSystem.writeFile(relatedSuiteFilePath, JSON.stringify(testSuite, null, 4));
      }
    }
  };

  const deleteTestCaseFile = async () => {
    const response = await fileSystem.deleteFileSystem(testCaseFilePath);
    if (!response.isSuccess) {
      if (response.errorMessage) {
        Notify.error(response.errorMessage);
      }
      return false;
    }
    return true;
  };

  const closeTestCaseEditorTab = () => {
    const tabIndex = $appState.tabs.findIndex((t) => t.id === nodePath);
    if (tabIndex >= 0) {
      appStateDispatch({ type: AppActionType.CloseTab, tabIndex: tabIndex });
    }
  };

  const handleDeleteClick = async () => {
    showDialog = false;

    const testCaseId = await getTestCaseId();

    if (!(await deleteTestCaseFile())) {
      return;
    }

    closeTestCaseEditorTab();

    const relatedSuiteFilePaths = getTestSuiteFilePaths();

    await removeTestCaseFromTestSuites(testCaseId, relatedSuiteFilePaths);
  };
  const handleCancelClick = () => {
    showDialog = false;
  };
</script>

{#if showDialog}
  <div class="relative" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="fixed inset-0 bg-gray-400 bg-opacity-75 transition-opacity" />
    <div class="fixed inset-0 overflow-y-auto">
      <div class="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
        <div
          class="modal-panel relative bg-white rounded-lg p-4 sm:p-6
                    text-left shadow-xl transform transition-all max-w-xl w-full"
        >
          <div class="modal-title text-xl leading-6 font-bold mb-8">
            {uiContext.str(stringResKeys.deleteTestCaseDialog.deleteTestCase)}
          </div>
          <div class="modal-content mb-8 flex flex-col gap-y-4">
            {#if relatedTestSuiteRelPaths.length}
              <div>
                {uiContext.str(stringResKeys.deleteTestCaseDialog.relatedSuitesMessage)}
              </div>
              <ul>
                {#each relatedTestSuiteRelPaths as relatedSuite}
                  <li>- {relatedSuite}</li>
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
              <StandardButton label={uiContext.str(stringResKeys.general.cancel)} on:click={handleCancelClick} />
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
