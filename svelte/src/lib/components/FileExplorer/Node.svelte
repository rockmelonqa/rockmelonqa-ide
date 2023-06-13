<script lang="ts">
    import { AppActionType, appContextKey, type IAppContext } from "$lib/context/AppContext";
    import { stringResKeys } from "$lib/context/StringResKeys";
    import { uiContextKey, type IUiContext } from "$lib/context/UiContext";
    import DeletePageWarningDialog from "$lib/dialogs/DeletePageWarningDialog.svelte";
    import DeleteTestCaseConfirmationDialog from "$lib/dialogs/DeleteTestCaseConfirmationDialog.svelte";
    import DeleteTestRoutineWarningDialog from "$lib/dialogs/DeleteTestRoutineWarningDialog.svelte";
    import { fileSystem } from "$lib/ipc";
    import type { IFileInfo } from "$lib/models";
    import { StandardFolder, type ITestCase } from "rockmelonqa.common";
    import type { IPage } from "rockmelonqa.common/file-defs/pageFile";
    import { getContext } from "svelte";
    import { v4 as uuidv4 } from "uuid";
    import { getEditor } from "../Editors/Editor";
    import FileIcon from "../FileIcon.svelte";
    import { FileType } from "../FileType";
    import { Notify } from "../Notify";
    import type { IGenericTab } from "../Tab/Tab";
    import Menu from "./Menu.svelte";
    import MenuDivider from "./MenuDivider.svelte";
    import MenuItem from "./MenuItem.svelte";
    import { buildChildrenNodes, extractPath, Node as NodeInfo, showMenuAt, toFileSystemPath } from "./Node";
    import NodeEditor from "./NodeEditor.svelte";

    export let node: NodeInfo;
    export let level: number = 0;

    let uiContext = getContext(uiContextKey) as IUiContext;
    let appContext = getContext(appContextKey) as IAppContext;
    let { state: appState, dispatch: appStateDispatch } = appContext;

    $: nodePath = node.toTreePath();
    $: fileSystemPath = toFileSystemPath(nodePath, $appState.projectFile?.folderPath ?? "", uiContext.pathSeparator);
    $: label = node.name;
    $: type = node.type;
    $: hasChildren = node.hasChildren;
    $: children = node.children;

    $: toggleable = type == FileType.Folder;
    $: selectable = true;
    $: selected = nodePath == $appState.selectedFile;
    $: showToggleIcon = hasChildren;

    $: showMenu = $showMenuAt === nodePath;
    $: editMode = node.editMode;
    let addMode: boolean = false;
    let typeToAdd: FileType = FileType.File;

    $: expanded = node.expanded || addMode;

    $: containerClass = `treeview-item 
        ${expanded ? "treeview-item-opened" : ""}`;
    $: rootItemClass = `treeview-item-root 
        ${toggleable ? "treeview-item-toggle" : ""} 
        ${selectable ? "treeview-item-selectable" : ""} 
        ${selected ? "treeview-item-selected" : ""}
        min-w-fit`;
    $: rootItemStyle = `padding-left: calc(var(--f7-treeview-item-padding-left) + var(--f7-treeview-children-offset) * ${level})`;

    let handleClick = async () => {
        if (toggleable) {
            // Toggle, but only reload chidren if:
            // - it is from collapsing to expanding
            // - hasChildren, but not load yet
            if (!expanded && hasChildren && children == null) {
                node.setChildren(NodeInfo.sort(await buildChildrenNodes(fileSystemPath)));
            }
            appStateDispatch({
                type: AppActionType.UpdateFile,
                nodePath: nodePath,
                value: { expanded: !expanded, children: node.children, hasChildren: node.hasChildren },
            });
        }

        if (selectable) {
            if (nodePath === $appState.selectedFile) {
                return;
            }

            appStateDispatch({ type: AppActionType.SelectFile, nodePath: nodePath });
            if (type === FileType.Folder) {
                return;
            }

            // If there is tab for this file, just activate it
            // Otherwise, add new tab
            const index = $appState.tabs.findIndex((x) => x.id === nodePath);
            if (index >= 0) {
                appStateDispatch({ type: AppActionType.SelectTab, tabIndex: index });
            } else {
                // Load editor (to edit content) if that is supported one
                const component = getEditor(label);
                if (!component) {
                    return;
                }

                const tab: IGenericTab<IFileInfo> = {
                    id: nodePath,
                    title: label,
                    tooltip: fileSystemPath,
                    content: {
                        component: component,
                        data: {
                            folderPath: extractPath(fileSystemPath, uiContext.pathSeparator).parentPath,
                            fileName: label,
                        },
                    },
                };
                appStateDispatch({ type: AppActionType.AddTab, tab });
            }
        }
    };

    let position = { x: 0, y: 0 };
    const handleRightClick = (e: any) => {
        if (selectable) {
            position = { x: e.clientX, y: e.clientY };
            showMenuAt.set(nodePath);
            appStateDispatch({ type: AppActionType.SelectFile, nodePath: nodePath });
        }
    };

    const closeMenu = () => {
        showMenuAt.set("");
    };

    const handleMenuNew = async (fileType: FileType) => {
        addMode = true;
        typeToAdd = fileType;
    };

    const isEnvFileNameValid = (fileName: string) => {
        const nameAndExt = fileName.split(".");
        if (nameAndExt.length != 2) {
            return false;
        }

        const name = nameAndExt[0];

        if (name) {
            const regex = /^[A-Za-z0-9_-]+$/;
            return regex.test(name);
        }

        return true;
    };

    const handleMenuRename = () => {
        appStateDispatch({
            type: AppActionType.UpdateFile,
            nodePath: nodePath,
            value: { editMode: true },
        });
    };

    const getCloneFileContent = async (): Promise<string> => {
        const srcFileContent = await fileSystem.readFile(fileSystemPath);

        if (!srcFileContent) {
            return "";
        }

        if (type === FileType.TCase) {
            const tcase = JSON.parse(srcFileContent) as ITestCase;
            tcase.id = uuidv4();
            tcase.steps.forEach((step) => (step.id = uuidv4()));
            return JSON.stringify(tcase);
        }
        if (type === FileType.Page) {
            const page = JSON.parse(srcFileContent) as IPage;
            page.id = uuidv4();
            return JSON.stringify(page);
        }
        return "";
    };

    const handleMenuClone = async () => {
        const cloneFileContent = await getCloneFileContent();
        const cloneFilePath = await fileSystem.getCloneFilePath(fileSystemPath);
        await fileSystem.writeFile(cloneFilePath, cloneFileContent);
    };

    const handleMenuDelete = async () => {
        if (type === FileType.Page && (await onDeletePage())) {
            return;
        } else if (type === FileType.TCase && (await onDeleteTestCase())) {
            return;
        } else if (type === FileType.TRoutine && (await onDeleteTestRoutine())) {
            return;
        }

        await doDeleteFile();
    };

    // Handle deleting a file/folder
    const doDeleteFile = async () => {
        const response = await fileSystem.deleteFileSystem(fileSystemPath);
        if (!response.isSuccess) {
            if (response.errorMessage) {
                Notify.error(response.errorMessage);
            }
            return;
        }

        if (type === FileType.Folder) {
            appStateDispatch({ type: AppActionType.SelectFile, nodePath: undefined });
            return;
        }

        // This is 'File', let's find related tab to close
        closeEditorTab();
    };

    const closeEditorTab = () => {
        const tabIndex = $appState.tabs.findIndex((t) => t.id === nodePath);
        if (tabIndex >= 0) {
            appStateDispatch({ type: AppActionType.CloseTab, tabIndex: tabIndex });
        }
    };

    const cancelNew = () => {
        addMode = false;
    };

    const submitNew = async (e: any) => {
        // create file or folder
        const { value } = e.detail;
        if (value) {
            let newPath = fileSystemPath + uiContext.pathSeparator + value;
            if (typeToAdd === FileType.Folder) {
                fileSystem.createFolder(newPath);
            } else {
                if (typeToAdd == FileType.Env) {
                    if (!isEnvFileNameValid(value)) {
                        return false;
                    }
                }
                await fileSystem.writeFile(newPath, "");
            }
        }

        // after creating new file/folder, has to expand parent node if it was collapsed
        // if not loaded children yet, let's do it
        // if already loaded children, leave FileExplorer-addNode append new node
        if (!node.expanded) {
            if (hasChildren && children == null) {
                node.setChildren(NodeInfo.sort(await buildChildrenNodes(fileSystemPath)));
            }

            appStateDispatch({
                type: AppActionType.UpdateFile,
                nodePath: nodePath,
                value: { expanded: true, hasChildren: node.hasChildren, children: node.children ?? [] },
            });
        }

        // turn of add mode
        addMode = false;
    };

    const cancelRename = () => {
        appStateDispatch({
            type: AppActionType.UpdateFile,
            nodePath: nodePath,
            value: { editMode: false },
        });
    };

    const submitRename = async (e: any) => {
        const { value: newName } = e.detail;

        // if not change, just exit edit mode
        if (label === newName) {
            appStateDispatch({
                type: AppActionType.UpdateFile,
                nodePath: nodePath,
                value: { editMode: false },
            });
            return;
        }

        if (newName.split('.')[1] === FileType.Env.toLowerCase()) {
            if (!isEnvFileNameValid(newName)) {
                return;
            }
        }

        // if change node name, invoke rename action
        let parentFilePath = extractPath(fileSystemPath, uiContext.pathSeparator).parentPath;
        let newFileSystemPath = parentFilePath + uiContext.pathSeparator + newName;
        const response = await fileSystem.rename(fileSystemPath, newFileSystemPath);
        if (response.isSuccess) {
            // leave watch handler update tree (remove old node, add new node)

            // update selectedPath
            const parentNodePath = NodeInfo.extractPath(nodePath).parentPath;
            let newNodePath = NodeInfo.combinePath(parentNodePath, newName);
            appStateDispatch({
                type: AppActionType.SelectFile,
                nodePath: newNodePath,
            });

            // let's update related tab if any
            const tabIndex = $appState.tabs.findIndex((t) => t.id === nodePath);
            if (tabIndex < 0) {
                return;
            }

            let tabToUpdate = {
                id: newNodePath,
                title: newName,
                tooltip: newFileSystemPath,
                content: {
                    data: {
                        folderPath: parentFilePath,
                        fileName: newName,
                    },
                },
            } as IGenericTab<IFileInfo>;
            appStateDispatch({
                type: AppActionType.UpdateTab,
                tabIndex: tabIndex,
                value: tabToUpdate,
            });
        } else {
            // false, let's show error if any
            if (response.errorMessage) {
                Notify.error(response.errorMessage);
            }

            // then exit edit mode
            appStateDispatch({
                type: AppActionType.UpdateFile,
                nodePath: nodePath,
                value: { editMode: false },
            });
        }
    };

    /**************************************
     * Handle page deletion
     ***************************************/
    let showDeletePageWarningDialog: boolean = false;
    let relatedTestCasePaths: string[] = [];
    let relatedTestRoutinePaths: string[] = [];

    const onDeletePage = async (): Promise<boolean> => {
        const page = Array.from($appState.pages.values()).find((p) => p.filePath === fileSystemPath);
        if (!page) {
            return false;
        }

        relatedTestCasePaths = Array.from($appState.testCases.values())
            .filter((tc) => tc.steps.some((s) => s.type === "testStep" && s.page === page.id))
            .map((tc) => tc.filePath)
            .sort();

        relatedTestRoutinePaths = Array.from($appState.testRoutines.values())
            .filter((tr) => tr.steps.some((s) => s.page === page.id))
            .map((tr) => tr.filePath)
            .sort();

        if (relatedTestCasePaths.length > 0 || relatedTestRoutinePaths.length > 0) {
            showDeletePageWarningDialog = true;
            return true;
        }

        return false;
    };

    /**************************************
     * Handle test case deletion
     ***************************************/
    let showDeleteTestCaseConfirmationDialog: boolean = false;
    let relatedTestSuitePaths: string[] = [];

    /**
     * Return true if we want to stop 'delete' workflow. Otherwise, 'false' to act as normally
     */
    const onDeleteTestCase = async (): Promise<boolean> => {
        const testCase = Array.from($appState.testCases.values()).find((tc) => tc.filePath === fileSystemPath);
        if (!testCase) {
            return false;
        }

        relatedTestSuitePaths = Array.from($appState.testSuites.values())
            .filter((ts) => ts.testcases.some((tcId) => tcId === testCase.id))
            .map((ts) => ts.filePath)
            .sort();

        if (relatedTestSuitePaths.length > 0) {
            showDeleteTestCaseConfirmationDialog = true;
            return true;
        }

        return false;
    };

    /**************************************
     * Handle test routine deletion
     ***************************************/
    let showDeleteTestRoutineWarningDialog: boolean = false;
    const onDeleteTestRoutine = async (): Promise<boolean> => {
        const testRoutine = Array.from($appState.testRoutines.values()).find((tr) => tr.filePath === fileSystemPath);
        if (!testRoutine) {
            return false;
        }

        relatedTestCasePaths = Array.from($appState.testCases.values())
            .filter((tc) => tc.steps.some((s) => s.type === "routine" && s.routine === testRoutine.id))
            .map((tc) => tc.filePath)
            .sort();

        if (relatedTestCasePaths.length > 0) {
            showDeleteTestRoutineWarningDialog = true;
            return true;
        }

        return false;
    };
</script>

<div class={containerClass}>
    {#if editMode}
        <NodeEditor value={node.name} type={node.type} {level} on:cancel={cancelRename} on:submit={submitRename} />
    {:else}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div
            class={rootItemClass}
            style={rootItemStyle}
            on:click={handleClick}
            on:contextmenu|preventDefault={handleRightClick}
        >
            {#if showToggleIcon}
                <div class="treeview-toggle" />
            {/if}
            <div class="treeview-item-content">
                <FileIcon {type} />
                <div class="treeview-item-label whitespace-nowrap">
                    {label}
                </div>
            </div>
        </div>
        {#if hasChildren || addMode}
            <div class="treeview-item-children">
                {#if addMode}
                    <NodeEditor type={typeToAdd} level={level + 1} on:cancel={cancelNew} on:submit={submitNew} />
                {/if}
                {#each children ?? [] as child}
                    <svelte:self node={child} level={level + 1} />
                {/each}
            </div>
        {/if}
    {/if}
</div>

{#if showMenu}
    <Menu {...position} on:click={closeMenu} on:clickoutside={closeMenu}>
        {#if type == FileType.Folder}
            <MenuItem
                label={uiContext.str(stringResKeys.fileExplorer.newFolder)}
                on:click={() => handleMenuNew(FileType.Folder)}
            />
            {#if nodePath.includes(StandardFolder.PageDefinitions)}
                <MenuItem
                    label={uiContext.str(stringResKeys.fileExplorer.newPage)}
                    on:click={() => handleMenuNew(FileType.Page)}
                />
            {:else if nodePath.includes(StandardFolder.TestCases)}
                <MenuItem
                    label={uiContext.str(stringResKeys.fileExplorer.newTestCase)}
                    on:click={() => handleMenuNew(FileType.TCase)}
                />
            {:else if nodePath.includes(StandardFolder.TestRoutines)}
                <MenuItem
                    label={uiContext.str(stringResKeys.fileExplorer.newTestRoutine)}
                    on:click={() => handleMenuNew(FileType.TRoutine)}
                />
            {:else if nodePath.includes(StandardFolder.TestSuites)}
                <MenuItem
                    label={uiContext.str(stringResKeys.fileExplorer.newTestSuite)}
                    on:click={() => handleMenuNew(FileType.TSuite)}
                />
            {:else if nodePath.includes(StandardFolder.Config)}
                <MenuItem
                    label={uiContext.str(stringResKeys.fileExplorer.newEnvFile)}
                    on:click={() => handleMenuNew(FileType.Env)}
                />
            {:else}
                <MenuItem
                    label={uiContext.str(stringResKeys.fileExplorer.newFile)}
                    on:click={() => handleMenuNew(FileType.File)}
                />
            {/if}
        {/if}
        {#if node.parent}
            {#if type == FileType.Folder}
                <MenuDivider />
            {/if}
            <MenuItem label="Rename" on:click={handleMenuRename} />
            {#if type == FileType.Page || type == FileType.TCase}
                <MenuItem label="Clone" on:click={handleMenuClone} />
            {/if}
            <MenuDivider />
            <MenuItem label="Delete" on:click={handleMenuDelete} />
        {/if}
    </Menu>
{/if}

<DeletePageWarningDialog
    bind:showDialog={showDeletePageWarningDialog}
    testCaseFilePaths={relatedTestCasePaths}
    testRoutineFilePaths={relatedTestRoutinePaths}
/>

<DeleteTestCaseConfirmationDialog
    bind:showDialog={showDeleteTestCaseConfirmationDialog}
    testCaseFilePath={fileSystemPath}
    suiteFilePaths={relatedTestSuitePaths}
    on:deleteConfirmed={doDeleteFile}
/>

<DeleteTestRoutineWarningDialog
    bind:showDialog={showDeleteTestRoutineWarningDialog}
    testCaseFilePaths={relatedTestCasePaths}
/>
