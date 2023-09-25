<script lang="ts">
    import PrimaryButton from "$lib/components/PrimaryButton.svelte";
    import StandardButton from "$lib/components/StandardButton.svelte";
    import { stringResKeys } from "$lib/context/StringResKeys";
    import { uiContextKey, type IUiContext } from "$lib/context/UiContext";
    import { UiParserFormatter } from "$lib/context/UiParserFormatter";
    import { application, autoUpdater } from "$lib/ipc";
    import type { ProgressInfo, UpdateDownloadedEvent, UpdateInfo } from "electron-updater";
    import type { Action, IAppInfo } from "rockmelonqa.common";
    import { getContext, onDestroy, onMount } from "svelte";

    export let showDialog: boolean = false;
    const uiContext = getContext(uiContextKey) as IUiContext;

    const cleanupFns: Action[] = [];
    let versionInfo: IAppInfo;
    let autoUpdateMsg: string = "";
    let isProcessing: boolean = false;
    let showCheckUpdateBtn: boolean = true;
    let showUpdateBtn: boolean = false;

    const parserFormatter = new UiParserFormatter(uiContext);

    onMount(async () => {
        versionInfo = await application.getAppInfo();

        registerListener(
            autoUpdater.onCheckingForUpdate(() => {
                autoUpdateMsg = uiContext.str(stringResKeys.aboutDialog.checkingForUpdateMsg);
            })
        );

        registerListener(
            autoUpdater.onError((error: any) => {
                console.log("Error on auto update");
                console.error(error);

                autoUpdateMsg = uiContext
                    .str(stringResKeys.aboutDialog.checkingForUpdateMsg)
                    .replace("{{errorMessage}}", error.message);
                isProcessing = false;
            })
        );

        registerListener(
            autoUpdater.onUpdateAvailable((info: UpdateInfo) => {
                autoUpdateMsg = uiContext
                    .str(stringResKeys.aboutDialog.updateAvailableMsg)
                    .replace("{{version}}", info.version);
                showCheckUpdateBtn = false;
                showUpdateBtn = true;
                isProcessing = false;
            })
        );

        registerListener(
            autoUpdater.onUpdateNotAvailable((info: UpdateInfo) => {
                autoUpdateMsg = uiContext.str(stringResKeys.aboutDialog.updateNotAvailableMsg);
                showCheckUpdateBtn = true;
                showUpdateBtn = false;
                isProcessing = false;
            })
        );

        registerListener(
            autoUpdater.onDownloadProgress((info: ProgressInfo) => {
                const percentStr = parserFormatter.formatInteger(info.percent);
                const totalSizeStr = parserFormatter.formatFloat(info.total / 1024 / 1024);
                autoUpdateMsg = uiContext
                    .str(stringResKeys.aboutDialog.downloadingMsg)
                    .replace("{{percent}}", percentStr)
                    .replace("{{totalSize}}", totalSizeStr);
                // need progress-bar?
            })
        );

        registerListener(
            autoUpdater.onUpdateDownloaded((info: UpdateDownloadedEvent) => {
                autoUpdateMsg = uiContext.str(stringResKeys.aboutDialog.updateDownloadedMsg);
                autoUpdater.quitAndInstall();
            })
        );
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

    const handleCloseClick = () => {
        showDialog = false;
    };

    const handleCheckUpdateClick = () => {
        isProcessing = true;
        autoUpdater.checkForUpdates();
    };

    const handleUpdateClick = () => {
        isProcessing = true;
        autoUpdater.startDownloadUpdate();
        autoUpdateMsg = uiContext.str(stringResKeys.aboutDialog.startDownloadUpdateMsg);
    };
</script>

{#if showDialog}
    <div class="relative" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="fixed inset-0 bg-gray-400 bg-opacity-75 transition-opacity" />
        <div class="fixed inset-0 overflow-y-auto z-30">
            <div class="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
                <div
                    class="modal-panel relative bg-white rounded-lg p-4 sm:p-6
                    text-left shadow-xl transform transition-all max-w-xl w-full"
                >
                    <div class="modal-title text-xl leading-6 font-bold mb-8">
                        {uiContext.str(stringResKeys.application.name)}
                    </div>
                    <div class="modal-content mb-8 flex flex-col gap-y-4">
                        <div>{uiContext.str(stringResKeys.aboutDialog.version)}: {versionInfo.version} alpha</div>
                        <div>{autoUpdateMsg}</div>
                    </div>
                    <div class="modal-buttons flex justify-start items-end gap-x-4">
                        <div class="ml-auto">
                            {#if showCheckUpdateBtn}
                                <PrimaryButton
                                    label={uiContext.str(stringResKeys.aboutDialog.checkUpdateBtn)}
                                    class="mr-4"
                                    on:click={handleCheckUpdateClick}
                                    disabled={isProcessing}
                                />
                            {/if}
                            {#if showUpdateBtn}
                                <PrimaryButton
                                    label={uiContext.str(stringResKeys.aboutDialog.updateBtn)}
                                    class="mr-4"
                                    on:click={handleUpdateClick}
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
