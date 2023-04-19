<script lang="ts">
  import { AppActionType, appContextKey, type IAppContext } from "$lib/context/AppContext";
  import { uiContextKey, type IUiContext } from "$lib/context/UiContext";
  import DeleteTestCaseDialog from "$lib/dialogs/DeleteTestCaseDialog.svelte";
  import { codeGenerator, fileSystem } from "$lib/ipc";
  import type { IFileInfo } from "$lib/models";
  import { StandardFolder } from "rockmelonqa.common";
  import { getContext } from "svelte";
  import { getEditor } from "../Editors/Editor";
  import FileIcon from "../FileIcon.svelte";
  import { FileType } from "../FileType";
  import { Notify } from "../Notify";
  import type { IGenericTab } from "../Tab/Tab";
  import Menu from "./Menu.svelte";
  import MenuDivider from "./MenuDivider.svelte";
  import MenuItem from "./MenuItem.svelte";
  import { buildChildrenNodes, combinePath, extractPath, Node as NodeInfo, showMenuAt, toFileSystemPath } from "./Node";
  import NodeEditor from "./NodeEditor.svelte";

  export let node: NodeInfo;
  export let level: number = 0;

  let uiContext = getContext(uiContextKey) as IUiContext;
  let appContext = getContext(appContextKey) as IAppContext;
  let { state: appState, dispatch: appStateDispatch } = appContext;
  let showDeleteTestCaseDialog: boolean = false;

  $: nodePath = node.toTreePath();
  $: fileSystemPath = toFileSystemPath(nodePath, $appState.projectFile!.folderPath, uiContext.pathSeparator);
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
  let typeToAdd: FileType | undefined;

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

  const handleMenuNew = async (isDir: boolean) => {
    addMode = true;
    typeToAdd = isDir ? FileType.Folder : FileType.File;
  };

  const handleMenuRename = () => {
    appStateDispatch({
      type: AppActionType.UpdateFile,
      nodePath: nodePath,
      value: { editMode: true },
    });
  };

  let relatedTestSuiteRelPaths: string[] = [];

  const handleDeleteTestCase = async () => {
    const meta = await codeGenerator.generateProjectMetadata($appState.projectFile!);
    const testCase = meta?.testCases.find(
      (tc) => combinePath([tc.folderPath, tc.fileName], uiContext.pathSeparator) === fileSystemPath
    );

    if (meta?.testSuites) {
      relatedTestSuiteRelPaths = meta.testSuites
        .filter((suiteFile) => suiteFile.content.testcases.some((tcId) => tcId === testCase?.content.id))
        .map((suiteFile) => {
          const suiteFileFullPath = combinePath([suiteFile.folderPath, suiteFile.fileName], uiContext.pathSeparator);
          const suitesFolder = combinePath(
            [$appState.projectFile!.folderPath, StandardFolder.TestSuites],
            uiContext.pathSeparator
          );
          const suiteFileRelPath = suiteFileFullPath.replace(suitesFolder, "").substring(1);
          return suiteFileRelPath.replaceAll(uiContext.pathSeparator, "/");
        });
    }

    console.log("generateProjectMetadata", meta);
    console.log("testCase", testCase);
    console.log("relatedTestSuiteRelPaths", relatedTestSuiteRelPaths);
    showDeleteTestCaseDialog = true;
  };

  const handleMenuDelete = async () => {
    if (type === FileType.TCase) {
      await handleDeleteTestCase();
      return;
    }

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
    const tabIndex = $appState.tabs.findIndex((t) => t.id === nodePath);
    if (tabIndex >= 0) {
      appStateDispatch({ type: AppActionType.CloseTab, tabIndex: tabIndex });
    }
  };

  const cancelNew = () => {
    addMode = false;
  };

  const submitNew = async (e: any) => {
    const { value } = e.detail;
    if (value) {
      const newPath = fileSystemPath + uiContext.pathSeparator + value;
      if (typeToAdd === FileType.Folder) {
        fileSystem.createFolder(newPath);
      } else {
        await fileSystem.writeFile(newPath, "");
      }
    }

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
      <MenuItem label="New Folder..." on:click={() => handleMenuNew(true)} />
      <MenuItem label="New File..." on:click={() => handleMenuNew(false)} />
    {/if}
    {#if node.parent}
      {#if type == FileType.Folder}
        <MenuDivider />
      {/if}
      <MenuItem label="Rename" on:click={handleMenuRename} />
      <MenuDivider />
      <MenuItem label="Delete" on:click={handleMenuDelete} />
    {/if}
  </Menu>
{/if}

<DeleteTestCaseDialog
  bind:showDialog={showDeleteTestCaseDialog}
  {relatedTestSuiteRelPaths}
  testCaseFilePath={fileSystemPath}
  {nodePath}
/>
