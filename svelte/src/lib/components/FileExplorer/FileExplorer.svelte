<script lang="ts">
    import { AppActionType, appContextKey, type IAppContext } from "$lib/context/AppContext";
    import type { IPageData, IPageElementData, ITestCaseData, ITestCaseStepData, ITestRoutineData, ITestRoutineStepData, ITestSuiteData } from "$lib/context/AppContext.model";
    import { uiContextKey, type IUiContext } from "$lib/context/UiContext";
    import { fileSystem } from "$lib/ipc";
    import lodash from "lodash";
    import {
        StandardFileExtension,
        StandardFolder,
        type Action,
        type IAddFileWatchEventArgs,
        type ITestCase,
        type ITestRoutine,
        type ITestSuite,
    } from "rockmelonqa.common";
    import type { IPage } from "rockmelonqa.common/file-defs/pageFile";
    import { getContext, onDestroy } from "svelte";
    import { derived } from "svelte/store";
    import { FileType, getFileType } from "../FileType";
    import CollapsiblePanel from "./CollapsiblePanel.svelte";
    import { buildChildrenNodes, Node as NodeInfo, toFileSystemPath, toTreePath } from "./Node";
    import Nodes from "./Nodes.svelte";
    import type { ITestStepRegular, ITestStepRoutine } from "rockmelonqa.common/file-defs/testCaseFile";

    let uiContext = getContext(uiContextKey) as IUiContext;

    let appContext = getContext(appContextKey) as IAppContext;
    let { state: appState, dispatch: appStateDispatch } = appContext;
    $: projectFolderPath = $appState.projectFile?.folderPath ?? "";
    $: collaspibleHeader = $appState.projectFile?.content.name ?? "";
    $: nodes = $appState.files;

    // Subscribe project folder path to reload tree
    const projectFolderPathSubscription = derived(appState, ($appState) => $appState.projectFile?.folderPath);
    projectFolderPathSubscription.subscribe(async (newPath) => {
        if (!newPath) {
            return;
        }

        appStateDispatch({
            type: AppActionType.SetFiles,
            files: await buildChildrenNodes(newPath),
        });

        doCleanup();

        registerListener(
            fileSystem.onWatchAdd(async (data: IAddFileWatchEventArgs) => {
                await Promise.all([
                    // anonymous function
                    (async (data: IAddFileWatchEventArgs) => {
                        if (data.isReady) {
                            await addNode(data.path, false);
                        }
                    })(data),
                    loadFile(data.path),
                ]);
            })
        );

        registerListener(
            fileSystem.onWatchUnlink(async (path: string) => {
                await Promise.all([removeNode(path, false), unloadFile(path)]);
            })
        );

        registerListener(
            fileSystem.onWatchAddDir(async (path: string) => {
                await addNode(path, true);
            })
        );

        registerListener(
            fileSystem.onWatchUnlinkDir(async (path: string) => {
                await removeNode(path, true);
            })
        );

        registerListener(
            fileSystem.onWatchChange(async (path: string) => {
                await loadFile(path);
            })
        );

        fileSystem.watch(newPath);
    });

    // Subscribe latest active-tab-id to select related node
    const activeTabIdSubscription = derived(appState, ($appState) => $appState.activeTabId);
    activeTabIdSubscription.subscribe((tabId) => {
        if ($appState.selectedFile != tabId) {
            appStateDispatch({
                type: AppActionType.SelectFile,
                nodePath: tabId,
            });
        }
    });

    /**
     * List of functions to clean up ipc listener
     */
    const cleanupFns: Action[] = [];

    onDestroy(() => {
        doCleanup();
    });

    const doCleanup = () => {
        cleanupFns.forEach((listener) => listener());
        cleanupFns.length = 0; // clear array
    };

    const registerListener = (listener: Action | undefined) => {
        if (listener) {
            cleanupFns.push(listener);
        }
    };

    // Add node to FileExplorer
    const addNode = async (fileSystemPath: string, isDir: boolean) => {
        const nodePath = toTreePath(fileSystemPath, projectFolderPath, uiContext.pathSeparator);
        if (!nodePath) {
            return;
        }

        const { parentPath, name } = NodeInfo.extractPath(nodePath);
        if (!parentPath) {
            // No parent, this is root node.
            // Just build a node then add to root
            const newNode = await buildNode(fileSystemPath, name, isDir);
            let files: NodeInfo[] = [...nodes, newNode!];
            appStateDispatch({ type: AppActionType.SetFiles, files });
            return;
        }

        // if there is parent, try to find on tree
        const parentNode = NodeInfo.findNodeByPath(nodes, parentPath);
        if (!parentNode) {
            // if cannot find parent node on tree, do nothing
            // because tree has not expanded to this one yet
            return;
        }

        // now there is parent node on tree
        // 1) update hasChildren if required
        // 2) update children[] if required
        // => update node if required
        let newValue: Partial<NodeInfo> = {};
        if (!parentNode.hasChildren) {
            // now it has new child
            newValue.hasChildren = true;
        }
        // if parentNode.children is null/undefined (not lazy load), then leave it for next expanding action
        // if already loads children (not null/undefined), then append new node manually
        if (parentNode.children) {
            const newNode = await buildNode(fileSystemPath, name, isDir, parentNode, true);
            newValue.children = NodeInfo.sort([...parentNode.children, newNode!]);
        }
        if (!lodash.isEmpty(newValue)) {
            appStateDispatch({
                type: AppActionType.UpdateFile,
                nodePath: parentPath,
                value: newValue,
            });
        }
    };

    // Remove node out of FileExplorer
    const removeNode = async (fileSystemPath: string, isDir: boolean) => {
        const nodePath = toTreePath(fileSystemPath, projectFolderPath, uiContext.pathSeparator);
        if (!nodePath) {
            return;
        }

        const { parentPath, name } = NodeInfo.extractPath(nodePath);
        if (!parentPath) {
            // No parent (this is root node). Let's remove out of files hierarchy
            let files: NodeInfo[] = nodes.filter((f) => f.name !== name);
            appStateDispatch({ type: AppActionType.SetFiles, files });
            return;
        }

        // if there is parent, try to find on tree
        const parentNode = NodeInfo.findNodeByPath(nodes, parentPath);
        if (!parentNode) {
            // if cannot find parent node on tree, do nothing
            // because tree has not expanded to this one yet
            return;
        }

        // now there is parent node on tree
        // if parent node already loads its children, let's update manually
        if (parentNode.children && parentNode.children.length > 0) {
            const newValue: Partial<NodeInfo> = {};
            newValue.children = parentNode.children.filter((n) => n.name !== name);
            newValue.hasChildren = newValue.children.length > 0;
            appStateDispatch({
                type: AppActionType.UpdateFile,
                nodePath: parentPath,
                value: newValue,
            });
        } else {
            // this case: hasChildren = true and children[] is null
            // because children[] has not been loaded, we are not sure whether there is child node or not
            // let's get folder to update node with latest data
            const newNode = await buildNode(
                toFileSystemPath(parentPath, projectFolderPath, uiContext.pathSeparator),
                parentNode.name,
                true,
                parentNode.parent,
                true
            );

            // Parent folder (from OS) may be null, example:
            // - tree: /root/parent/child
            // - delete at 'parent'
            // - onWatch:unlinkDir fires at 'child' first, so cannot get 'parent' folder form OS file system
            if (newNode) {
                appStateDispatch({
                    type: AppActionType.UpdateFile,
                    nodePath: parentPath,
                    value: newNode,
                });
            }
        }
    };

    /**
     * Build tree node based on or file system path or given info
     * @param fileSystemPath
     * @param name
     * @param isDir
     * @param parent
     * @param includeChildren
     */
    const buildNode = async (
        fileSystemPath: string,
        name: string,
        isDir: boolean,
        parent?: NodeInfo,
        includeChildren?: boolean
    ): Promise<NodeInfo | null> => {
        if (isDir) {
            const folder = await fileSystem.getFolder(fileSystemPath, includeChildren);
            return folder
                ? new NodeInfo({
                      name: name,
                      parent: parent,
                      type: FileType.Folder,
                      hasChildren: folder!.hasChildren,
                  })
                : null;
        } else {
            return new NodeInfo({
                name: name,
                parent: parent,
                type: getFileType(name),
                hasChildren: false,
            });
        }
    };

    // Load file data into AppContext
    const loadFile = async (fileSystemPath: string) => {
        // Remove project folder path + the separator character
        const shortPath = fileSystemPath.substring(projectFolderPath.length + 1);

        // only proceed file at right location, and right extension
        if (
            shortPath.startsWith(StandardFolder.PageDefinitions + uiContext.pathSeparator) &&
            shortPath.endsWith(StandardFileExtension.Page)
        ) {
            await loadPageData(fileSystemPath);
        } else if (
            shortPath.startsWith(StandardFolder.TestCases + uiContext.pathSeparator) &&
            shortPath.endsWith(StandardFileExtension.TestCase)
        ) {
            await loadTestCaseData(fileSystemPath);
        } else if (
            shortPath.startsWith(StandardFolder.TestRoutines + uiContext.pathSeparator) &&
            shortPath.endsWith(StandardFileExtension.TestRoutine)
        ) {
            await loadTestRoutineData(fileSystemPath);
        } else if (
            shortPath.startsWith(StandardFolder.TestSuites + uiContext.pathSeparator) &&
            shortPath.endsWith(StandardFileExtension.TestSuite)
        ) {
            await loadTestSuiteData(fileSystemPath);
        }
    };

    const loadPageData = async (path: string) => {
        try {
            const fileContent = await fileSystem.readFile(path);
            if (!fileContent) {
                return;
            }

            const page = JSON.parse(fileContent) as IPage;
            const pageData = buildPageData(path, page);
            if (!pageData) {
                return;
            }

            appStateDispatch({
                type: AppActionType.SetPageData,
                data: pageData,
            });
        } catch (error) {
            console.log("Cannot load file", path);
            console.error(error);
        }
    };

    const buildPageData = (path: string, page: IPage): IPageData | null => {
        let name = toTreePath(path, $appState.projectFile?.folderPath!, uiContext.pathSeparator) ?? "";
        name = name.replace(new RegExp(`^${StandardFolder.PageDefinitions}${NodeInfo.PATH_SEPARATOR}`), "");

        const elementsMap: Map<string, IPageElementData> = page.elements
            .filter((e) => e.type === 'pageElement')
            .reduce((map, e) => {
                map.set(e.id, {
                    id: e.id,
                    name: e.name,
                    findBy: e.findBy,
                    locator: e.locator,
                });
                return map;
            }, new Map<string, IPageElementData>());

        return {
            id: page.id,
            name: name,
            elements: elementsMap,
            filePath: path,
        } as IPageData;
    };

    const loadTestCaseData = async (path: string) => {
        try {
            const fileContent = await fileSystem.readFile(path);
            if (!fileContent) {
                return;
            }

            const testCase = JSON.parse(fileContent) as ITestCase;
            const testCaseData = buildTestCaseData(path, testCase);
            if (!testCaseData) {
                return;
            }

            appStateDispatch({
                type: AppActionType.SetTestCaseData,
                data: testCaseData,
            });
        } catch (error) {
            console.log("Cannot load file", path);
            console.error(error);
        }
    };

    const buildTestCaseData = (path: string, testCase: ITestCase): ITestCaseData | null => {
        let name = toTreePath(path, $appState.projectFile?.folderPath!, uiContext.pathSeparator) ?? "";
        name = name.replace(new RegExp(`^${StandardFolder.TestCases}${NodeInfo.PATH_SEPARATOR}`), "");

        const steps = testCase.steps
            .filter((s) => s.type !== 'comment')
            .map((s) => {
                if (s.type === 'testStep') {
                    return {
                        id: s.id,
                        type: s.type,
                        page: s.page,
                        element: s.element,
                        action: s.action,
                        data: s.data
                    } as ITestStepRegular;
                } else if (s.type === 'routine') {
                    return {
                        id: s.id,
                        type: s.type,
                        routine: s.routine,
                        dataset: s.dataset,
                    } as ITestStepRoutine;
                }
            });

        return {
            id: testCase.id,
            name: name,
            steps: steps,
            filePath: path,
        } as ITestCaseData;
    };

    const loadTestRoutineData = async (path: string) => {
        try {
            const fileContent = await fileSystem.readFile(path);
            if (!fileContent) {
                return;
            }

            const testRoutine = JSON.parse(fileContent) as ITestRoutine;
            const testRoutineData = buildTestRoutineData(path, testRoutine);
            if (!testRoutineData) {
                return;
            }

            appStateDispatch({
                type: AppActionType.SetTestRoutineData,
                data: testRoutineData,
            });
        } catch (error) {
            console.log("Cannot load file", path);
            console.error(error);
        }
    };

    const buildTestRoutineData = (path: string, testRoutine: ITestRoutine): ITestRoutineData | null => {
        let name = toTreePath(path, $appState.projectFile?.folderPath!, uiContext.pathSeparator) ?? "";
        name = name.replace(new RegExp(`^${StandardFolder.TestRoutines}${NodeInfo.PATH_SEPARATOR}`), "");

        const steps = testRoutine.steps
            .filter((s) => s.type !== 'comment')
            .map((s) => { 
                return {
                    id: s.id,
                    page: s.page,
                    element: s.element,
                    action: s.action,
                    data: s.data,
                } as ITestRoutineStepData
            });

        return {
            id: testRoutine.id,
            name: name,
            steps: steps,
            filePath: path,
        } as ITestRoutineData;
    };

    const loadTestSuiteData = async (path: string) => {
        try {
            const fileContent = await fileSystem.readFile(path);
            if (!fileContent) {
                return;
            }

            const testSuite = JSON.parse(fileContent) as ITestSuite;
            const testSuiteData = buildTestSuiteData(path, testSuite);
            if (!testSuiteData) {
                return;
            }

            appStateDispatch({
                type: AppActionType.SetTestSuiteData,
                data: testSuiteData,
            });
        } catch (error) {
            console.log("Cannot load file", path);
            console.error(error);
        }
    };

    const buildTestSuiteData = (path: string, testSuite: ITestSuite): ITestSuiteData | null => {
        let name = toTreePath(path, $appState.projectFile?.folderPath!, uiContext.pathSeparator) ?? "";
        name = name.replace(new RegExp(`^${StandardFolder.TestSuites}${NodeInfo.PATH_SEPARATOR}`), "");

        return {
            id: testSuite.id,
            name: name,
            testcases: testSuite.testcases,
            filePath: path,
        } as ITestSuiteData;
    };

    // Unload file data out of AppContext
    const unloadFile = async (fileSystemPath: string) => {
        // Remove project folder path + the separator character
        const shortPath = fileSystemPath.substring(projectFolderPath.length + 1);

        // only proceed file at right location, and right extension
        if (
            shortPath.startsWith(StandardFolder.PageDefinitions + uiContext.pathSeparator) &&
            shortPath.endsWith(StandardFileExtension.Page)
        ) {
            appStateDispatch({ type: AppActionType.RemovePageData, filePath: fileSystemPath });
        } else if (
            shortPath.startsWith(StandardFolder.TestCases + uiContext.pathSeparator) &&
            shortPath.endsWith(StandardFileExtension.TestCase)
        ) {
            appStateDispatch({ type: AppActionType.RemoveTestCaseData, filePath: fileSystemPath });
        } else if (
            shortPath.startsWith(StandardFolder.TestRoutines + uiContext.pathSeparator) &&
            shortPath.endsWith(StandardFileExtension.TestRoutine)
        ) {
            appStateDispatch({ type: AppActionType.RemoveTestRoutineData, filePath: fileSystemPath });
        } else if (
            shortPath.startsWith(StandardFolder.TestSuites + uiContext.pathSeparator) &&
            shortPath.endsWith(StandardFileExtension.TestSuite)
        ) {
            appStateDispatch({ type: AppActionType.RemoveTestSuiteData, filePath: fileSystemPath });
        }
    };
</script>

<div class="file-explorer-container">
    {#if collaspibleHeader}
        <CollapsiblePanel title={collaspibleHeader} open={nodes.length > 0}>
            <Nodes {nodes} slot="body" />
        </CollapsiblePanel>
    {/if}
</div>
