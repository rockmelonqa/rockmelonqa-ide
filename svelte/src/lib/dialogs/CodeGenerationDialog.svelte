<script lang="ts">
    import PrimaryButton from "$lib/components/PrimaryButton.svelte";
    import Spinner from "$lib/components/Spinner.svelte";
    import StandardButton from "$lib/components/StandardButton.svelte";
    import { appContextKey, type IAppContext } from "$lib/context/AppContext";
    import { stringResKeys } from "$lib/context/StringResKeys";
    import { uiContextKey, type IUiContext } from "$lib/context/UiContext";
    import type { IUiTheme } from "$lib/context/UiTheme";
    import TextField from "$lib/controls/TextField.svelte";
    import WarningIcon from "$lib/icons/WarningIcon.svelte";
    import { codeGenerator } from "$lib/ipc";
    import _ from "lodash";
    import type { Action, IIpcGenericResponse, IProgressDetail } from "rockmelonqa.common";
    import { getContext, onDestroy, onMount } from "svelte";
    import { writable } from "svelte/store";

    const uiContext = getContext(uiContextKey) as IUiContext;
    const { theme } = uiContext;
    const uiTheme = $theme as IUiTheme;

    let appContext = getContext(appContextKey) as IAppContext;
    let { state: appState, dispatch: appStateDispatch } = appContext;

    export let showDialog: boolean = false;

    const cleanupFns: Action[] = [];
    let prerequisites: string[] = [];

    let isPrerequiring: boolean = true;
    let isProcessing: boolean = false;
    $: showSpinner = isPrerequiring || isProcessing;
    let spinnerText = uiContext.str(stringResKeys.codeGenerationDialog.checkPrerequisites);

    let showWarning: boolean = false;
    let dialogMessage: string = uiContext.str(stringResKeys.codeGenerationDialog.dialogMsg);
    let showStartBtn = false;

    const logs = writable<string[]>([]);
    $: hasLogs = $logs.length > 0;
    let showLogs: boolean = false;
    let logFile: string = "";

    onMount(async () => {
        registerListener(
            codeGenerator.onValidateInput((data: IProgressDetail) => {
                spinnerText = uiContext.str(stringResKeys.codeGenerationDialog.validateInputMsg);
                addLog(data.log);
            })
        );

        registerListener(
            codeGenerator.onParseData((data: IProgressDetail) => {
                spinnerText = uiContext.str(stringResKeys.codeGenerationDialog.parseDataMsg);
                addLog(data.log);
            })
        );

        registerListener(
            codeGenerator.onCleanFolder((data: IProgressDetail) => {
                spinnerText = uiContext.str(stringResKeys.codeGenerationDialog.cleanFolderMsg);
                addLog(data.log);
            })
        );

        registerListener(
            codeGenerator.onGenerateCode((data: IProgressDetail) => {
                spinnerText = uiContext.str(stringResKeys.codeGenerationDialog.generateCodeMsg);
                addLog(data.log);
            })
        );

        registerListener(
            codeGenerator.onCopyCustomCode((data: IProgressDetail) => {
                spinnerText = uiContext.str(stringResKeys.codeGenerationDialog.copyCustomCodeMsg);
                addLog(data.log);
            })
        )

        registerListener(
            codeGenerator.onBuild((data: IProgressDetail) => {
                spinnerText = uiContext.str(stringResKeys.codeGenerationDialog.buildMsg);
                addLog(data.log);
            })
        );

        registerListener(
            codeGenerator.onInstallDependencies((data: IProgressDetail) => {
                spinnerText = uiContext.str(stringResKeys.codeGenerationDialog.installDependenciesMsg);
                addLog(data.log);
            })
        );

        registerListener(
            codeGenerator.onFinish((response: IIpcGenericResponse<{ logFile: string }>) => {
                const { isSuccess, errorMessage, data } = response;
                if (isSuccess) {
                    dialogMessage = uiContext.str(stringResKeys.codeGenerationDialog.finishedMsg);
                } else {
                    dialogMessage = uiContext.str(stringResKeys.codeGenerationDialog.errorMsg);
                    addLog(errorMessage ?? "Unknown error");
                    showLogs = true;
                }

                if (data) {
                    logFile = data.logFile;
                }

                showWarning = !isSuccess;
                isProcessing = false;
            })
        );

        let hasIssue = false;
        try {
            // verify environments
            prerequisites = await codeGenerator.prerequire($appState.projectFile!);
            if (prerequisites.length) {
                hasIssue = true;
                return;
            }

            // verify duplicated objects
            let duplicateObjects = await findDuplicatedObjects();
            if (duplicateObjects.length) {
                dialogMessage = `"${duplicateObjects[0]}" ${uiContext.str(stringResKeys.general.and)} "${
                    duplicateObjects[1]
                }" ${uiContext.str(stringResKeys.codeGenerationDialog.duplicateFileNameMessage)}`;

                hasIssue = true;
                return;
            }
        } finally {
            showWarning = hasIssue;
            showStartBtn = !hasIssue;
            isPrerequiring = false;
        }
    });

    /** Returns the first pair duplicated items (cases, pages, suites) by outputFilePath */
    const findDuplicatedObjects = async (): Promise<string[]> => {
        const meta = await codeGenerator.generateOutputProjectMetadata($appState.projectFile!);
        if (!meta) {
            return [];
        }

        const duplicateTestCases = findDuplicatedItems(meta.cases);
        if (duplicateTestCases.length) {
            return duplicateTestCases;
        }

        const duplicatePages = findDuplicatedItems(meta.pages);
        if (duplicatePages.length) {
            return duplicatePages;
        }

        const duplicateTestSuites = findDuplicatedItems(meta.suites);
        if (duplicateTestSuites.length) {
            return duplicateTestSuites;
        }

        return [];
    };

    /** Returns the first pair duplicated items by outputFilePath */
    const findDuplicatedItems = (items: { outputFilePath: string; inputFileRelPath: string }[]): string[] => {
        // Group the items by "outputFilePath", the find the first group that has more than 1 item.
        const groups = _(
            items.map((item) => ({
                inputFileRelPath: item.inputFileRelPath,
                outputFilePath: item.outputFilePath.toLocaleLowerCase(),
            }))
        )
            .groupBy("outputFilePath")
            .map(function (items, outputFilePath) {
                return {
                    outputFilePath,
                    inputFileRelPaths: _.map(items, "inputFileRelPath"),
                };
            })
            .value();

        const duplicateGroup = groups.find((g) => g.inputFileRelPaths.length > 1);
        if (duplicateGroup) {
            const [file1Name, file2Name] = duplicateGroup?.inputFileRelPaths;
            return [file1Name, file2Name];
        }
        return [];
    };

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

    const handleStartClick = async () => {
        isProcessing = true;
        showStartBtn = false;

        codeGenerator.genCode($appState.projectFile!);
    };

    const handleCloseClick = () => {
        showDialog = false;
    };

    const toPrerequisiteText = (item: string) => {
        switch (item) {
            case "dotnet":
                return "Dotnet 6.0 or higher";
            case "node":
                return "Node version 16.16 or higher";
            case "pwsh":
                return "Powershell (pwsh)";
            default:
                return "";
        }
    };

    const toggleLogs = () => {
        showLogs = !showLogs;
    };
</script>

{#if showDialog}
    <div class="relative" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="fixed inset-0 bg-gray-400 bg-opacity-75 transition-opacity" />
        <div class="fixed inset-0 overflow-y-auto">
            <div class="flex items-end sm:items-center justify-center min-h-full p-4 sm:p-0 text-center">
                <div
                    class={`modal-panel relative bg-white rounded-lg p-4 sm:p-6
                    text-left shadow-xl transform transition-all ${showLogs ? "max-w-5xl" : "max-w-xl"} w-full`}
                >
                    <div class="modal-title text-xl leading-6 font-bold mb-8">
                        <div class="flex items-center gap-x-2">
                            {#if showWarning}
                                <span class="warning">
                                    <WarningIcon class="h-8 w-8" fill="currentColor" strokeColor="white" />
                                </span>
                            {/if}
                            <span>{uiContext.str(stringResKeys.codeGenerationDialog.dialogTitle)}</span>
                        </div>
                    </div>
                    <div class="modal-content mb-8">
                        {#if showSpinner}
                            <Spinner class="py-4" textRight={spinnerText} />
                        {:else if prerequisites.length > 0}
                            <div class="mb-4">Please install following package(s) to generate code:</div>
                            <ul class="pl-4 list-disc">
                                {#each prerequisites as item}
                                    <li>{toPrerequisiteText(item)}</li>
                                {/each}
                            </ul>
                        {:else}
                            <div>{dialogMessage}</div>
                        {/if}

                        {#if showLogs}
                            <div class="flex flex-col mt-4 gap-y-4">
                                <div class="logs h-96 overflow-y-auto border-y py-4 flex flex-col gap-y-2">
                                    {#each $logs as log}
                                        <p>{@html log.replace(new RegExp(uiContext.eol, "g"), "<br/>")}</p>
                                    {/each}
                                </div>
                                {#if logFile}
                                    <TextField
                                        label={uiContext.str(stringResKeys.codeGenerationDialog.logFile)}
                                        name="log-file"
                                        value={logFile}
                                        readonly={true}
                                        theme={uiTheme.textField}
                                    />
                                {/if}
                            </div>
                        {/if}
                    </div>
                    <div class="modal-buttons flex justify-start items-center gap-x-4">
                        {#if hasLogs}
                            <a href={"#"} on:click={toggleLogs} class="underline">
                                <span>{showLogs ? "Hide " : "Show "} Details</span>
                            </a>
                        {/if}
                        <div class="ml-auto">
                            {#if showStartBtn}
                                <PrimaryButton
                                    label={uiContext.str(stringResKeys.general.start)}
                                    class="mr-4"
                                    on:click={handleStartClick}
                                    disabled={isProcessing}
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

    .warning {
        color: var(--color-alert--bright);
    }

    li:not(:last-child) {
        margin-bottom: 0.5rem;
    }

    a {
        color: var(--color-brand);
        cursor: pointer;
    }
</style>
