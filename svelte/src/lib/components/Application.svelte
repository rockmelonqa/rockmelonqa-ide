<script lang="ts">
    import { goto } from "$app/navigation";
    import { AppActionType, appContextKey, type IAppContext } from "$lib/context/AppContext";
    import { uiContextKey, type IUiContext } from "$lib/context/UiContext";
    import AboutDialog from "$lib/dialogs/AboutDialog.svelte";
    import CodeGenerationDialog from "$lib/dialogs/CodeGenerationDialog.svelte";
    import NewProjectDialog from "$lib/dialogs/NewProjectDialog.svelte";
    import RunTestDialog from "$lib/dialogs/RunTestDialog/RunTestDialog.svelte";
    import { application, window as windowIpc } from "$lib/ipc";
    import type { IFileInfo } from "$lib/models";
    import getWindow from "$lib/utils/getWindow";
    import { NavRoute } from "$lib/utils/NavRoute";
    import { registerRecentProject } from "$lib/utils/userSettings";
    import type { IRmProjFile } from "rockmelonqa.common";
    import type { Action, IIpcGenericResponse, IShowHideMenuRequest } from "rockmelonqa.common/ipc-defs";
    import { getContext, onDestroy, onMount, setContext, tick } from "svelte";
    import { buildChildrenNodes, extractPath, Node, toFileSystemPath } from "../components/FileExplorer/Node";
    import { appActionContextKey, type IAppActionContext, type OnSaveHandler } from "./Application";
    import { getEditor } from "./Editors/Editor";
    import { combinePath } from "./FileExplorer/Node";
    import { Notify } from "./Notify";
    import type { IGenericTab } from "./Tab/Tab";
    import AlertDialog from "./AlertDialog.svelte";
    import { AlertDialogButtons, AlertDialogType } from "./Alert";

    const window = getWindow();

    let uiContext = getContext(uiContextKey) as IUiContext;
    let appContext = getContext(appContextKey) as IAppContext;
    let { state: appState, dispatch: appStateDispatch } = appContext;
    $: projectFolder = $appState.projectFile?.folderPath ?? "";

    let showNewProjectDialog: boolean = false;
    let showAboutDialog: boolean = false;
    let showCodeGenerationDialog: boolean = false;
    let showRunTestDialog: boolean = false;

    let closeProjectDialogType: AlertDialogType = AlertDialogType.None;
    let exitDialogType: AlertDialogType = AlertDialogType.None;

    /**
     * List of functions to clean up ipc listener
     */
    const cleanupFns: Action[] = [];
    const registerListener = (listener: Action | undefined) => {
        if (listener) {
            cleanupFns.push(listener);
        }
    };

    /***********************************************
     * Event Handlers
     ************************************************/
    onMount(async () => {
        const env = await application.getEnvironmentInfo();
        uiContext.pathSeparator = env.pathSeparator;
        uiContext.eol = env.eol;

        registerListener(
            application.onLoadProject(async (model: IIpcGenericResponse<IRmProjFile>) => {
                if (model.isSuccess) {
                    let projectFile = model.data as IRmProjFile;
                    await loadProject(projectFile);
                } else {
                    if (model.errorMessage) {
                        Notify.error(model.errorMessage);
                    }
                }
            })
        );

        registerListener(
            application.onCloseProject(() => {
                const hasDirtyTab = $appState.tabs.some((x) => x.isDirty);
                if (hasDirtyTab) {
                    closeProjectDialogType = AlertDialogType.Question;
                } else {
                    doCloseProject();
                }
            })
        );

        registerListener(application.onQuit(quit));

        registerListener(
            windowIpc.onShow((data) => {
                showNewProjectDialog = data === "dialog:NewProject";
                showAboutDialog = data === "dialog:About";
            })
        );

        // Listen keyup to handle Ctrl+S
        window!.addEventListener("keyup", onKeyUp);

        // Listen to handle closing dirty tab
        window!.addEventListener("beforeunload", onBeforeUnload);

        if (!$appState.projectFile) {
            goto(NavRoute.GET_STARTED);
        }
    });

    onDestroy(() => {
        cleanupFns.forEach((listener) => listener());
        cleanupFns.length = 0; // clear array

        window?.removeEventListener("keyup", onKeyUp);
        window?.removeEventListener("beforeunload", onBeforeUnload);
    });

    /** List of onSave event handlers, from opening tabs
     * Key: tab index
     * Value: onSave function
     */
    let tabOnSaveHandlers: Map<number, OnSaveHandler | undefined> = new Map();

    /***********************************************
     * Application functions declaration
     ************************************************/
    const loadProject = async (projectFile: IRmProjFile) => {
        appStateDispatch({ type: AppActionType.LoadProject, projectFile: projectFile });
        tabOnSaveHandlers.clear();

        application.showHideMenuItem({
            menuItemPath: "fileMenu/Close Project",
            visible: true,
        } as IShowHideMenuRequest);
        await registerRecentProject(
            projectFile.content.name,
            `${projectFile.folderPath}${uiContext.pathSeparator}${projectFile.fileName}`
        );

        goto(NavRoute.HOME);
    };

    /** open relative file path into a new tab*/
    const openFile = (relativeFilePath: string) => {
        const { parentPath: folderPath, name: fileName } = extractPath(relativeFilePath, uiContext.pathSeparator);

        // Load editor (to edit content) if that is supported one
        const component = getEditor(relativeFilePath);
        if (!component) {
            return;
        }

        const absoluteFolderPath = combinePath([projectFolder, folderPath], uiContext.pathSeparator);
        const absoluteFilePath = combinePath([absoluteFolderPath, fileName], uiContext.pathSeparator);
        const nodePath = relativeFilePath.replaceAll(uiContext.pathSeparator, Node.PATH_SEPARATOR);

        const tab: IGenericTab<IFileInfo> = {
            id: nodePath,
            title: fileName,
            tooltip: absoluteFilePath,
            content: {
                component: component,
                data: {
                    folderPath: absoluteFolderPath,
                    fileName: fileName,
                },
            },
        };
        appStateDispatch({ type: AppActionType.AddTab, tab });
        expandToNode(nodePath);
        appStateDispatch({ type: AppActionType.SelectFile, nodePath: nodePath });
    };
    const expandToNode = async (nodePath: string) => {
        let pathSegments = nodePath.split(Node.PATH_SEPARATOR);
        const rootNode = $appState.files.find((x) => x.name === pathSegments[0])!;

        let processingNode: Node | undefined = rootNode;
        for (let i = 1; i < pathSegments.length; i++) {
            processingNode = await findNode(processingNode, pathSegments[i]);
            if (!processingNode) {
                return;
            }
        }

        // expand the final folder, which contains files
        processingNode.expanded = true;
        await loadChildNode(processingNode);
        appStateDispatch({ type: AppActionType.UpdateFile, nodePath: rootNode.toTreePath(), value: rootNode });
    };
    /**
     * Given (parent) node, find child node based on its name
     */
    const findNode = async (node: Node, lookupName: string): Promise<Node | undefined> => {
        if (!node.hasChildren) {
            return undefined;
        }

        node.expanded = true;
        if (!node.children) {
            await loadChildNode(node);
        }

        let childNode = node.children!.find((x) => x.name === lookupName);
        return childNode;
    };
    const loadChildNode = async (node: Node) => {
        const treePath = node.toTreePath();
        const fileSystemPath = toFileSystemPath(treePath, projectFolder, uiContext.pathSeparator);
        node.setChildren(Node.sort(await buildChildrenNodes(fileSystemPath)));
    };

    const quit = () => {
        window!.close();
    };

    /***********************************************
     * Application methods public to children components
     ************************************************/
    setContext(appActionContextKey, {
        /** Load selected *.rmproj file */
        loadProject: loadProject,

        /** Open selected file in new tab */
        openFile: openFile,

        // get, add, delete tab-content on-save handler
        getOnSaveHandler: (contentIndex: number) => tabOnSaveHandlers.get(contentIndex),
        registerOnSaveHandler: (contentIndex: number, func: OnSaveHandler) => tabOnSaveHandlers.set(contentIndex, func),
        unregisterOnSaveHandler: (contentIndex: number) => tabOnSaveHandlers.delete(contentIndex),

        showCodeGenerationDialog: () => (showCodeGenerationDialog = true),
        showNewProjectDialog: () => (showNewProjectDialog = true),
        showRunTestDialog: () => (showRunTestDialog = true),

        /** Exit app */
        quit: quit,
    }) as IAppActionContext;

    /***********************************************
     * Helpers
     ************************************************/
    const onKeyUp = async (e: KeyboardEvent) => {
        if (e.ctrlKey && e.key === "s") {
            if (!$appState.tabs.length) {
                return;
            }

            if (!$appState.tabs[$appState.activeTabIndex].isDirty) {
                return;
            }

            const handler = tabOnSaveHandlers.get($appState.activeTabIndex);
            if (handler) {
                await handler();
            }
        }
    };

    /** Determine whether there is dirty tab, to display save pending changes dialog */
    const onBeforeUnload = (event: any) => {
        if (localStorage.preventHotReloadClosing) {
            console.log(
                "%c%s",
                "color: red; font-size: 1rem",
                "Press Ctrl+C in the command line to force close. Or run `delete localStorage.preventHotReloadClosing` and click the close button again."
            );
            event.returnValue = "any-value-to-prevent-default";
            return false;
        }

        const hasDirtyTab = $appState.tabs.some((x) => x.isDirty);
        if (hasDirtyTab) {
            event.returnValue = "any-value-to-prevent-default";
            exitDialogType = AlertDialogType.Question;
        } else {
            quit();
        }
    };

    const handleCloseProjectConfirm = async (event: any) => {
        const button = event.detail.button;
        if (button === "cancel") {
            return;
        }

        if (button === "no") {
            doCloseProject();
            return;
        }

        // yes
        const tabsToClose = [];
        for (let index = 0; index < $appState.tabs.length; index++) {
            let tab = $appState.tabs[index];
            if (tab.isDirty) {
                const handler = tabOnSaveHandlers.get(index);
                if (handler != null) {
                    const success = await handler();
                    if (!success) {
                        continue; // do not close this tab
                    }
                }
            }

            tabsToClose.push(index);
        }

        if (tabsToClose.length === $appState.tabs.length) {
            doCloseProject();
        } else {
            appStateDispatch({ type: AppActionType.CloseTabs, tabIndexes: tabsToClose });
        }
    };
    const doCloseProject = () => {
        // clear all state then go to landing page
        appStateDispatch({ type: AppActionType.UnloadProject });
        tabOnSaveHandlers.clear();
        application.showHideMenuItem({
            menuItemPath: "fileMenu/Close Project",
            visible: false,
        } as IShowHideMenuRequest);

        goto(NavRoute.GET_STARTED);
    };

    const handleExitConfirm = async (event: any) => {
        const button = event.detail.button;
        if (button === "cancel") {
            return;
        }

        if (button === "no") {
            // Clear dirtay tab checking before quit
            window?.removeEventListener("beforeunload", onBeforeUnload);
            quit();
            return;
        }

        // yes
        const tabsToClose = [];
        for (let index = 0; index < $appState.tabs.length; index++) {
            let tab = $appState.tabs[index];
            if (tab.isDirty) {
                const handler = tabOnSaveHandlers.get(index);
                if (handler != null) {
                    const success = await handler();
                    if (!success) {
                        continue; // do not close this tab
                    }
                }
            }

            tabsToClose.push(index);
        }

        if (tabsToClose.length === $appState.tabs.length) {
            quit();
        } else {
            appStateDispatch({ type: AppActionType.CloseTabs, tabIndexes: tabsToClose });
        }
    };
</script>

<slot />

{#if showNewProjectDialog}
    <NewProjectDialog bind:showDialog={showNewProjectDialog} />
{/if}

{#if showCodeGenerationDialog}
    <CodeGenerationDialog bind:showDialog={showCodeGenerationDialog} />
{/if}

{#if showRunTestDialog}
    <RunTestDialog bind:showDialog={showRunTestDialog} />
{/if}

<AboutDialog bind:showDialog={showAboutDialog} />

<AlertDialog
    id="closeProjectDialog"
    bind:type={closeProjectDialogType}
    buttons={AlertDialogButtons.YesNoCancel}
    on:click={handleCloseProjectConfirm}
>
    <div slot="content">Do you want to save all pending changes?</div>
</AlertDialog>

<AlertDialog
    id="exitDialog"
    bind:type={exitDialogType}
    buttons={AlertDialogButtons.YesNoCancel}
    on:click={handleExitConfirm}
>
    <div slot="content">Do you want to save all pending changes?</div>
</AlertDialog>
