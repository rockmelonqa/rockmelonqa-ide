<script lang="ts">
    import { goto } from '$app/navigation';
    import { AppActionType, appContextKey, type IAppContext } from '$lib/context/AppContext';
    import { uiContextKey, type IUiContext } from '$lib/context/UiContext';
    import AboutDialog from '$lib/dialogs/AboutDialog.svelte';
    import CodeGenerationDialog from '$lib/dialogs/CodeGenerationDialog.svelte';
    import NewProjectDialog from '$lib/dialogs/NewProjectDialog.svelte';
    import RunTestDialog from '$lib/dialogs/RunTestDialog/RunTestDialog.svelte';
    import { application, window as windowIpc } from '$lib/ipc';
    import type { IFileInfo } from '$lib/models';
    import getWindow from '$lib/utils/getWindow';
    import { NavRoute } from '$lib/utils/NavRoute';
    import { registerRecentProject } from '$lib/utils/userSettings';
    import type { IRmProjFile } from 'rockmelonqa.common';
    import type { Action, IIpcGenericResponse } from 'rockmelonqa.common/ipc-defs';
    import { getContext, onDestroy, onMount, setContext } from 'svelte';
    import { buildChildrenNodes, extractPath, Node, toFileSystemPath } from '../components/FileExplorer/Node';
    import { appActionContextKey, type IAppActionContext, type OnSaveHandler } from './Application';
    import { getEditor } from './Editors/Editor';
    import { combinePath } from './FileExplorer/Node';
    import { Notify } from './Notify';
    import type { IGenericTab } from './Tab/Tab';

    const window = getWindow();

    let uiContext = getContext(uiContextKey) as IUiContext;
    let appContext = getContext(appContextKey) as IAppContext;
    let { state: appState, dispatch: appStateDispatch } = appContext;
    $: projectFolder = $appState.projectFile?.folderPath ?? '';

    let showNewProjectDialog: boolean = false;
    let showAboutDialog: boolean = false;
    let showCodeGenerationDialog: boolean = false;
    let showRunTestDialog: boolean = false;

    /**
     * List of functions to clean up ipc listener
     */
    const cleanupFns: Action[] = [];
    const registerListener = (listener: Action | undefined) => {
        if (listener) {
            cleanupFns.push(listener);
        }
    };

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
            windowIpc.onShow((data) => {
                showNewProjectDialog = data === 'dialog:NewProject';
                showAboutDialog = data === 'dialog:About';
            })
        );

        window!.addEventListener('keyup', onKeyUp);

        if (!$appState.projectFile) {
            goto(NavRoute.GET_STARTED);
        }
    });

    onDestroy(() => {
        cleanupFns.forEach((listener) => listener());
        cleanupFns.length = 0; // clear array

        window?.removeEventListener('keyup', onKeyUp);
    });

    const onKeyUp = async (e: KeyboardEvent) => {
        if (e.ctrlKey && e.key === 's') {
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

    /** List of onSave event handlers, from opening tabs
     * Key: tab index
     * Value: onSave function
     */
    let tabOnSaveHandlers: Map<number, OnSaveHandler | undefined> = new Map();

    const loadProject = async (projectFile: IRmProjFile) => {
        appStateDispatch({ type: AppActionType.LoadProject, projectFile: projectFile });
        tabOnSaveHandlers.clear();

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

    setContext(appActionContextKey, {
        getOnSaveHandler: (contentIndex: number) => tabOnSaveHandlers.get(contentIndex),
        loadProject: loadProject,
        openFile: openFile,
        registerOnSaveHandler: (contentIndex: number, func: OnSaveHandler) => tabOnSaveHandlers.set(contentIndex, func),
        showCodeGenerationDialog: () => (showCodeGenerationDialog = true),
        showNewProjectDialog: () => (showNewProjectDialog = true),
        showRunTestDialog: () => (showRunTestDialog = true),
        unregisterOnSaveHandler: (contentIndex: number) => tabOnSaveHandlers.delete(contentIndex),
    }) as IAppActionContext;
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
