<script lang="ts">
    import { appActionContextKey, type IAppActionContext } from '$lib/components/Application';
    import PrimaryButton from '$lib/components/PrimaryButton.svelte';
    import Spinner from '$lib/components/Spinner.svelte';
    import StandardButton from '$lib/components/StandardButton.svelte';
    import { appContextKey, type IAppContext } from '$lib/context/AppContext';
    import { stringResKeys } from '$lib/context/StringResKeys';
    import { uiContextKey, type IUiContext } from '$lib/context/UiContext';
    import type { IUiTheme } from '$lib/context/UiTheme';
    import TextField from '$lib/controls/TextField.svelte';
    import DropdownField from '$lib/form-controls/DropdownField.svelte';
    import Form from '$lib/form-controls/Form.svelte';
    import { FieldDataType } from '$lib/form/FieldDef';
    import { createFormContext } from '$lib/form/FormContext';
    import type { IFormDef } from '$lib/form/FormDef';
    import { FormModeState } from '$lib/form/FormMode';
    import { FormSerializer } from '$lib/form/FormSerializer';
    import WarningIcon from '$lib/icons/WarningIcon.svelte';
    import { codeGenerator, testRunner } from '$lib/ipc';
    import { getBrowserDropDownOptions } from '$lib/utils/dropdowns';
    import {
        StandardOutputFolder,
        type Action,
        type IIpcGenericResponse,
        type IProgressDetail,
    } from 'rockmelonqa.common';
    import type { ISuiteInfo } from 'rockmelonqa.common/codegen/types';
    import type { IRunTestResponseData } from 'rockmelonqa.common/ipc-defs';
    import { getContext, onDestroy, onMount } from 'svelte';
    import { get, writable } from 'svelte/store';
    import { combinePath } from '../../components/FileExplorer/Node';
    import { NodeInfo, NodeType } from './NodeInfo';
    import TestExplorer from './TestExplorer.svelte';
    import { createTestExplorerContext, TestExplorerActionType } from './TestExplorerContext';
    import TestExplorerContext from './TestExplorerContext.svelte';

    const uiContext = getContext(uiContextKey) as IUiContext;
    const { theme } = uiContext;
    const uiTheme = $theme as IUiTheme;

    let appContext = getContext(appContextKey) as IAppContext;
    let { state: appState, dispatch: appStateDispatch } = appContext;

    const testExplorerContext = createTestExplorerContext();
    let { state: testExplorerState, dispatch: testExplorerDispatch } = testExplorerContext;

    const formDef: IFormDef = {
        fields: {
            browser: {
                dataType: FieldDataType.Dropdown,
                dataPath: 'browser',
            },
        },
    };

    let formContext = createFormContext('runSettings', formDef, uiContext, FormModeState.Edit);
    let {
        mode: formMode,
        modeDispatch: formModeDispatch,
        data: formData,
        dataDispatch: formDataDispatch,
    } = formContext;

    export let showDialog: boolean = false;

    const cleanupFns: Action[] = [];
    let isProcessing: boolean = false;
    let spinnerText = '';
    let showWarning: boolean = false;
    let dialogMessage = '';

    let allowRunTest = false;

    const logs = writable<string[]>([]);
    $: hasLogs = $logs.length > 0;
    let showLogs: boolean = false;

    const data = writable<IRunTestResponseData | undefined>(undefined);
    $: storageFolder = $data?.storageFolder ?? '';
    $: resultFileName = $data?.resultFileName ?? '';

    const { openFile } = getContext(appActionContextKey) as IAppActionContext;

    /** Build a tree of test suites/cases from the suite metadata */
    const loadTextExplorer = (suites: ISuiteInfo[]) => {
        if (!suites.length) {
            return;
        }

        const rootNode = new NodeInfo({
            name: StandardOutputFolder.TestSuites,
            nodeType: NodeType.Folder,
            children: [],
        });

        for (const suite of suites) {
            const parts = suite.inputFileRelPath.split(uiContext.pathSeparator);
            let currentNode = rootNode;
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                let existingNode = currentNode.children.find((node) => node.name === part);

                if (!existingNode) {
                    const nodeType = i === parts.length - 1 ? NodeType.Suite : NodeType.Folder;
                    const newNode = new NodeInfo({ name: part, nodeType, parent: i === 1 ? undefined : currentNode });
                    if (nodeType === NodeType.Suite) {
                        newNode.name = part;
                        newNode.suiteInfo = suite;
                        newNode.selected.set(true);
                        const caseNodes = suite.testCases.map(
                            (c) =>
                                new NodeInfo({
                                    name: c.inputFileRelPath,
                                    nodeType: NodeType.Case,
                                    children: [],
                                    parent: newNode,
                                    selected: true,
                                    caseInfo: c,
                                })
                        );
                        newNode.children = caseNodes;
                    }

                    currentNode.children.push(newNode);
                    existingNode = newNode;
                }

                currentNode = existingNode;
            }
        }

        // We dont want to render 'TestSuites' root node
        testExplorerDispatch({ type: TestExplorerActionType.Load, nodes: rootNode.children });
    };

    onMount(async () => {
        registerListener(
            testRunner.onFinish((response: IIpcGenericResponse<IRunTestResponseData>) => {
                const { isSuccess, errorMessage } = response;
                data.set(response.data);

                if (isSuccess) {
                    dialogMessage = uiContext.str(stringResKeys.runTestDialog.finishedMsg);
                } else {
                    dialogMessage = uiContext.str(stringResKeys.runTestDialog.errorMsg);
                    addLog(errorMessage ?? 'Unknown error');
                    showLogs = true;
                }

                showWarning = !isSuccess;
                isProcessing = false;
            })
        );

        registerListener(
            testRunner.onRunningTest((data: IProgressDetail) => {
                spinnerText = uiContext.str(stringResKeys.runTestDialog.runningTestMsg);
                addLog(data.log);
            })
        );

        const { suites, error } = await codeGenerator.getSuitesMetadata($appState.projectFile!);
        const hasTestCases = suites.some((suite: ISuiteInfo) => suite.testCases.length);
        allowRunTest = hasTestCases && !error;

        if (allowRunTest) {
            dialogMessage = uiContext.str(stringResKeys.runTestDialog.testAvailableMsg);
            await loadTextExplorer(suites);
        } else {
            if (error) {
                dialogMessage = error.message;
            } else {
                dialogMessage = uiContext.str(stringResKeys.runTestDialog.testNotAvailableMsg);
            }
        }
    });

    onDestroy(() => {
        cleanupFns.forEach((listener) => listener());
        cleanupFns.length = 0; // clear array
    });

    const registerListener = (listener: Action | undefined) => {
        if (listener) {
            cleanupFns.push(listener);
        }
    };

    const addLog = (log: string | undefined) => {
        if (log) {
            logs.update((arr) => [...arr, log]);
        }
    };

    const handleCloseClick = async () => {
        showDialog = false;
    };

    const handleRunClick = () => {
        isProcessing = true;
        allowRunTest = false;

        // TODO: build filter based on Language and Framework
        const filter = buildDotnetFilter();
        if (filter) {
            const serializer = new FormSerializer(uiContext);
            const model = serializer.serialize($formData.values, formDef.fields);
            testRunner.runTest({
                projFile: $appState.projectFile!,
                setting: {
                    browser: model.browser,
                    dotnetFilterStr: filter,
                },
            });
        } else {
            showWarning = true;

            allowRunTest = true;
            isProcessing = false;
        }
    };

    const buildDotnetFilter = (): string => {
        const selectedCases = findSelectedCases($testExplorerState.nodes);
        return selectedCases.map((node) => node.caseInfo!.fullyQualifiedName).join('|');
    };

    function findSelectedCases(nodes: NodeInfo[]): NodeInfo[] {
        const result: NodeInfo[] = [];
        for (const node of nodes) {
            if ((node.nodeType === NodeType.Folder || node.nodeType === NodeType.Suite) && node.children) {
                const matchingChildren = findSelectedCases(node.children);
                result.push(...matchingChildren);
            } else if (get(node.selected)) {
                // TestCase && selected
                result.push(node);
            }
        }
        return result;
    }

    const toggleLogs = () => {
        showLogs = !showLogs;
    };

    const openTestResult = () => {
        openFile(combinePath([storageFolder, resultFileName], uiContext.pathSeparator));
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
                    text-left shadow-xl transform transition-all max-w-4xl w-full"
                >
                    <div class="modal-title text-xl leading-6 font-bold mb-8">
                        <div class="flex items-center gap-x-2">
                            {#if showWarning}
                                <span class="warning">
                                    <WarningIcon class="h-8 w-8" fill="currentColor" strokeColor="white" />
                                </span>
                            {/if}
                            <span>{uiContext.str(stringResKeys.runTestDialog.dialogTitle)}</span>
                        </div>
                    </div>
                    <div class="modal-content mb-8">
                        {#if isProcessing}
                            <Spinner class="py-4" textRight={spinnerText} />
                        {:else}
                            <div class="mb-4">
                                {@html dialogMessage.replace(new RegExp(uiContext.eol, 'g'), '<br/>')}
                            </div>
                            {#if allowRunTest}
                                <div class="max-h-[70vh] overflow-y-auto mb-4 bg-gray-50">
                                    <TestExplorerContext {testExplorerContext}>
                                        <TestExplorer />
                                    </TestExplorerContext>
                                </div>

                                <Form {formContext}>
                                    <div class="bg-neutral-200 font-bold px-4 py-3">
                                        {uiContext.str(stringResKeys.runTestDialog.selectBrowser)}
                                    </div>
                                    <DropdownField name="browser" options={getBrowserDropDownOptions(uiContext)} />
                                </Form>
                            {/if}
                        {/if}

                        {#if showLogs}
                            <div class="flex flex-col mt-4 gap-y-4">
                                <div class="logs h-96 overflow-y-auto border-y py-4 flex flex-col gap-y-2">
                                    {#each $logs as log}
                                        <p>{@html log.replace(new RegExp(uiContext.eol, 'g'), '<br/>')}</p>
                                    {/each}
                                </div>
                                {#if storageFolder}
                                    <TextField
                                        label={uiContext.str(stringResKeys.runTestDialog.testOutput)}
                                        name="log-file"
                                        value={storageFolder}
                                        readonly={true}
                                        theme={uiTheme.textField}
                                    />
                                {/if}
                            </div>
                        {/if}
                    </div>
                    <div class="modal-buttons flex justify-start items-center gap-x-4">
                        {#if hasLogs}
                            <a href={'#'} on:click={toggleLogs} class="underline">
                                <span>{showLogs ? 'Hide ' : 'Show '} Details</span>
                            </a>
                        {/if}
                        {#if resultFileName}
                            <a href={'#'} on:click={openTestResult} class="underline">
                                <span>View Result</span>
                            </a>
                        {/if}
                        <div class="ml-auto">
                            {#if allowRunTest}
                                <PrimaryButton
                                    label={uiContext.str(stringResKeys.runTestDialog.runTestBtn)}
                                    class="mr-4"
                                    on:click={handleRunClick}
                                />
                            {/if}
                            <StandardButton
                                label={uiContext.str(stringResKeys.general.close)}
                                on:click={handleCloseClick}
                                disabled={isProcessing}
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

    a {
        color: var(--color-brand);
        cursor: pointer;
    }
</style>
