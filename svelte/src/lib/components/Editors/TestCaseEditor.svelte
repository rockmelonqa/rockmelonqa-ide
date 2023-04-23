<script lang="ts">
  import { appContextKey, type IAppContext } from "$lib/context/AppContext";
  import { stringResKeys } from "$lib/context/StringResKeys";
  import { uiContextKey, type IUiContext } from "$lib/context/UiContext";
  import type { IUiTheme } from "$lib/context/UiTheme";
  import type { IDropdownOption } from "$lib/controls/DropdownField";
  import FancyDropdownField from "$lib/controls/FancyDropdownField.svelte";
  import FormGroup from "$lib/controls/layout/FormGroup.svelte";
  import FormGroupColumn from "$lib/controls/layout/FormGroupColumn.svelte";
  import TextField from "$lib/controls/TextField.svelte";
  import Form from "$lib/form-controls/Form.svelte";
  import FormTextField from "$lib/form-controls/TextField.svelte";
  import { FieldDataType, type IDictionary } from "$lib/form/FieldDef";
  import { createFormContext } from "$lib/form/FormContext";
  import { FormDataActionType } from "$lib/form/FormData";
  import type { IFormDef } from "$lib/form/FormDef";
  import { FormModeState } from "$lib/form/FormMode";
  import { FormSerializer } from "$lib/form/FormSerializer";
  import { createListDataContext, ListDataActionType } from "$lib/form/ListData";
  import type { IListDef } from "$lib/form/ListDef";
  import AddIcon from "$lib/icons/AddIcon.svelte";
  import CommentIcon from "$lib/icons/CommentIcon.svelte";
  import DeleteIcon from "$lib/icons/DeleteIcon.svelte";
  import MoveDownIcon from "$lib/icons/MoveDownIcon.svelte";
  import MoveUpIcon from "$lib/icons/MoveUpIcon.svelte";
  import SaveIcon from "$lib/icons/SaveIcon.svelte";
  import { fileSystem } from "$lib/ipc";
  import { getActionTypeDropDownOptions } from "$lib/utils/dropdowns";
  import { fileDefFactory, type ITestCase, type ITestStep } from "rockmelonqa.common";
  import { createEventDispatcher, getContext, onMount } from "svelte";
  import { derived } from "svelte/store";
  import { v4 as uuidv4 } from "uuid";
  import { AlertDialogButtons, AlertDialogType } from "../Alert";
  import AlertDialog from "../AlertDialog.svelte";
  import { appActionContextKey, type IAppActionContext } from "../Application";
  import CommentTextField from "../CommentTextField.svelte";
  import { combinePath } from "../FileExplorer/Node";
  import IconLinkButton from "../IconLinkButton.svelte";
  import { ListTableCellType } from "../ListTable";
  import ListTable from "../ListTable.svelte";
  import ListTableBodyCell from "../ListTableBodyCell.svelte";
  import ListTableBodyRow from "../ListTableBodyRow.svelte";
  import ListTableHeaderCell from "../ListTableHeaderCell.svelte";
  import PrimaryButton from "../PrimaryButton.svelte";
  import { toTitle } from "./Editor";

  const uiContext = getContext(uiContextKey) as IUiContext;
  const { theme } = uiContext;
  const uiTheme = $theme as IUiTheme;

  export let folderPath: string;
  export let fileName: string;
  $: filePath = combinePath([folderPath, fileName], uiContext.pathSeparator);

  export let contentIndex: number;

  let appContext = getContext(appContextKey) as IAppContext;
  let { state: appState, dispatch: appStateDispatch } = appContext;
  const formDef: IFormDef = {
    fields: {
      id: {
        dataType: FieldDataType.Text,
        dataPath: "id",
        isRequired: true,
      },
      description: {
        dataType: FieldDataType.Text,
        dataPath: "description",
      },
    },
  };
  let formContext = createFormContext("testCaseEditor", formDef, uiContext, FormModeState.Edit);
  let { mode: formMode, modeDispatch: formModeDispatch, data: formData, dataDispatch: formDataDispatch } = formContext;

  const listDef: IListDef = {
    fields: {
      id: {
        dataType: FieldDataType.Text,
        dataPath: "id",
      },
      type: {
        dataType: FieldDataType.Text,
        dataPath: "type",
      },
      page: {
        dataType: FieldDataType.Dropdown,
        dataPath: "page",
      },
      element: {
        dataType: FieldDataType.Dropdown,
        dataPath: "element",
      },
      action: {
        dataType: FieldDataType.Dropdown,
        dataPath: "action",
      },
      data: {
        dataType: FieldDataType.Text,
        dataPath: "data",
      },
      comment: {
        dataType: FieldDataType.Text,
        dataPath: "comment",
      },
    },
  };
  let listDataContext = createListDataContext(listDef, uiContext);
  let { value: listData, dispatch: listDataDispatch } = listDataContext;

  $: title = toTitle(fileName);
  let deleteDialogType: AlertDialogType = AlertDialogType.None;
  let indexToDelete: number;

  // Key: page id.  Value: page name
  let pageDefinitionOptions: IDropdownOption[] = [];
  // Key: page id.  Value: page element options
  let pageElementsMap: Map<string, IDropdownOption[]>;
  let actionTypeOptions: IDropdownOption[] = getActionTypeDropDownOptions(uiContext);

  const { registerOnSaveHandler, unregisterOnSaveHandler } = getContext(appActionContextKey) as IAppActionContext;
  const dispatch = createEventDispatcher();

  const pagesSubscription = derived(appState, ($appState) => $appState.pages);
  pagesSubscription.subscribe((pages) => {
    pageDefinitionOptions = Array.from(pages.entries())
      .map(([key, { name }]) => ({ key, text: name } as IDropdownOption))
      .sort((a, b) => a.text.localeCompare(b.text));

    pageElementsMap = new Map();
    for (const [pageId, pageData] of pages) {
      const dropdownOptions: IDropdownOption[] = [];
      for (const [elementId, elementData] of pageData.elements) {
        dropdownOptions.push({
          key: elementId,
          text: elementData.name,
        });
      }
      dropdownOptions.sort((a, b) => a.text.localeCompare(b.text));
      pageElementsMap.set(pageId, dropdownOptions);
    }
  });

  onMount(async () => {
    // default/empty data
    let model: ITestCase = fileDefFactory.newTestCase();

    // parse file content if any
    const fileContent = await fileSystem.readFile(filePath);
    if (fileContent) {
      model = JSON.parse(fileContent) as ITestCase;
    }

    const serializer = new FormSerializer(uiContext);
    const fieldValues = serializer.deserialize(model, formDef.fields);
    formDataDispatch({ type: FormDataActionType.Load, newValues: fieldValues });

    const items = serializer.deserializeList(model.steps, listDef.fields);
    listDataDispatch({ type: ListDataActionType.SetItems, items: items, hasMoreItems: false });

    registerOnSaveHandler(contentIndex, doSave);

    return () => {
      unregisterOnSaveHandler(contentIndex);
    };
  });

  const isComment = (item: IDictionary) => {
    return (item as ITestStep).type === "comment";
  };

  const handleSave = async () => {
    await doSave();
  };

  const doSave = async (): Promise<boolean> => {
    if ($formData.isValid) {
      const serializer = new FormSerializer(uiContext);
      const model = serializer.serialize($formData.values, formDef.fields);

      const items = $listData.items.filter((r) => !isEmptyItem(r));
      const steps = serializer.serializeList(items, listDef.fields);

      const data = { ...model, steps };
      const filePath = combinePath([folderPath, fileName], uiContext.pathSeparator);
      await fileSystem.writeFile(filePath, JSON.stringify(data, null, 4));

      dispatch("saved");
      return true;
    }

    formDataDispatch({ type: FormDataActionType.ShowAllErrors });
    return false;
  };

  const handleSelectPage = async (index: number, key: string, value: any) => {
    handleItemChange(index, key, value);
    const pageData = $appState.pages.get(value);
  };

  const handleItemChange = (index: number, key: string, value: any) => {
    const item = { ...$listData.items[index] };
    item[key] = value;

    listDataDispatch({
      type: ListDataActionType.UpdateItem,
      index,
      item,
    });

    dispatchChange();
  };

  const dispatchChange = () => {
    dispatch("change");
  };

  const handleDeleteClick = (index: number) => {
    // Determine if this row has any input.
    // If yes, show confirmation dialog. Otherwise, delete straight away
    if (isEmptyItem($listData.items[index])) {
      doDeleteRow(index);
    } else {
      deleteDialogType = AlertDialogType.Question;
      indexToDelete = index;
    }
  };

  const isEmptyItem = (item: IDictionary) => {
    const ignoredProperties: string[] = ["id", "type"];
    return Object.entries(item)
      .filter(([key, value]) => !ignoredProperties.includes(key))
      .map(([key, value]) => value)
      .every((x) => !x);
  };

  const handleDeleteConfirmation = async (event: any) => {
    if (event.detail.button === "delete") {
      doDeleteRow(indexToDelete);
    }
  };

  const doDeleteRow = (index: number) => {
    listDataDispatch({
      type: ListDataActionType.RemoveItem,
      index: index,
    });

    dispatchChange();
  };

  const handleMoveUpClick = (index: number) => {
    if (index >= 1 && index <= $listData.items.length - 1) {
      listDataDispatch({
        type: ListDataActionType.SwapItems,
        indexA: index,
        indexB: index - 1,
      });

      dispatchChange();
    }
  };

  const handleMoveDownClick = (index: number) => {
    if (index >= 0 && index <= $listData.items.length - 2) {
      listDataDispatch({
        type: ListDataActionType.SwapItems,
        indexA: index,
        indexB: index + 1,
      });

      dispatchChange();
    }
  };

  const handleAddStep = () => {
    listDataDispatch({
      type: ListDataActionType.AppendItems,
      items: [newStep()],
      hasMoreItems: false,
    });

    dispatchChange();
  };
  const handleInsertStep = (index: number) => {
    listDataDispatch({
      type: ListDataActionType.InsertItem,
      item: newStep(),
      index: index + 1,
    });

    dispatchChange();
  };
  const newStep = (): ITestStep => {
    return { id: uuidv4(), type: "testStep", name: "", description: "", data: "" } as ITestStep;
  };

  const handleAddComment = () => {
    listDataDispatch({
      type: ListDataActionType.AppendItems,
      items: [newComment()],
      hasMoreItems: false,
    });

    dispatchChange();
  };
  const handleInsertComment = (index: number) => {
    listDataDispatch({
      type: ListDataActionType.InsertItem,
      item: newComment(),
      index: index + 1,
    });

    dispatchChange();
  };
  const newComment = (): ITestStep => {
    return { id: uuidv4(), type: "comment", comment: "" } as ITestStep;
  };
</script>

<div class="test-case-editor p-8">
  <div class="font-semibold text-xl mb-4">{title}</div>
  <Form {formContext}>
    <FormGroup columns={1}>
      <FormGroupColumn>
        <FormTextField
          name="description"
          theme={uiTheme.inlineTextField}
          on:input={dispatchChange}
          displayLabel={false}
          placeholder={uiContext.str(stringResKeys.testCaseEditor.description)}
        />
      </FormGroupColumn>
    </FormGroup>
  </Form>

  <ListTable class="table-fixed mb-8" isProcessing={$formMode.isLoading() || $formMode.isProcessing()} isEmpty={false}>
    <svelte:fragment slot="header">
      <ListTableHeaderCell type={ListTableCellType.First} class="text-left w-2/12">
        {uiContext.str(stringResKeys.testCaseEditor.action)}
      </ListTableHeaderCell>
      <ListTableHeaderCell type={ListTableCellType.Normal} class="text-left w-3/12">
        {uiContext.str(stringResKeys.testCaseEditor.page)}
      </ListTableHeaderCell>
      <ListTableHeaderCell type={ListTableCellType.Normal} class="text-left w-3/12">
        {uiContext.str(stringResKeys.testCaseEditor.element)}
      </ListTableHeaderCell>
      <ListTableHeaderCell type={ListTableCellType.Last} class="text-left w-3/12">
        {uiContext.str(stringResKeys.testCaseEditor.data)}
      </ListTableHeaderCell>
      <ListTableHeaderCell type={ListTableCellType.LastAction} class="text-center w-1/12">
        {uiContext.str(stringResKeys.testCaseEditor.actions)}
      </ListTableHeaderCell>
    </svelte:fragment>
    <svelte:fragment slot="body">
      {#each $listData.items as item, index}
        <ListTableBodyRow>
          {#if isComment(item)}
            <ListTableBodyCell type={ListTableCellType.First} colspan={4}>
              <CommentTextField
                name={`${formContext.formName}_${index}_comment`}
                value={item.comment}
                placeholder={uiContext.str(stringResKeys.testCaseEditor.comment)}
                on:input={(event) => handleItemChange(index, "comment", event.detail.value)}
              />
            </ListTableBodyCell>
          {:else}
            <ListTableBodyCell type={ListTableCellType.First}>
              <FancyDropdownField
                name={`${formContext.formName}_${index}_action`}
                value={item.action}
                options={actionTypeOptions}
                on:change={(event) => handleItemChange(index, "action", event.detail.value)}
              />
            </ListTableBodyCell>
            <ListTableBodyCell type={ListTableCellType.Normal}>
              <FancyDropdownField
                name={`${formContext.formName}_${index}_page`}
                value={item.page}
                options={pageDefinitionOptions}
                on:change={(event) => handleSelectPage(index, "page", event.detail.value)}
              />
            </ListTableBodyCell>
            <ListTableBodyCell type={ListTableCellType.Normal}>
              <FancyDropdownField
                name={`${formContext.formName}_${index}_element`}
                value={item.element}
                options={pageElementsMap.get(item.page) ?? []}
                on:change={(event) => handleItemChange(index, "element", event.detail.value)}
              />
            </ListTableBodyCell>
            <ListTableBodyCell type={ListTableCellType.Last}>
              <TextField
                name={`${formContext.formName}_${index}_data`}
                value={item.data}
                on:input={(event) => handleItemChange(index, "data", event.detail.value)}
              />
            </ListTableBodyCell>
          {/if}
          <ListTableBodyCell type={ListTableCellType.LastAction} class="align-bottom whitespace-nowrap">
            {#if isComment(item)}
              <IconLinkButton
                on:click={() => handleInsertComment(index)}
                title={uiContext.str(stringResKeys.general.add)}
              >
                <svelte:fragment slot="icon"><AddIcon /></svelte:fragment>
              </IconLinkButton>
            {:else}
              <IconLinkButton on:click={() => handleInsertStep(index)} title={uiContext.str(stringResKeys.general.add)}>
                <svelte:fragment slot="icon"><AddIcon /></svelte:fragment>
              </IconLinkButton>
            {/if}
            <IconLinkButton
              on:click={() => handleDeleteClick(index)}
              title={uiContext.str(stringResKeys.general.delete)}
            >
              <svelte:fragment slot="icon"><DeleteIcon /></svelte:fragment>
            </IconLinkButton>
            {#if index > 0}
              <IconLinkButton
                on:click={() => handleMoveUpClick(index)}
                title={uiContext.str(stringResKeys.general.moveUp)}
              >
                <svelte:fragment slot="icon"><MoveUpIcon /></svelte:fragment>
              </IconLinkButton>
            {/if}
            {#if index < $listData.items.length - 1}
              <IconLinkButton
                on:click={() => handleMoveDownClick(index)}
                title={uiContext.str(stringResKeys.general.moveDown)}
              >
                <svelte:fragment slot="icon"><MoveDownIcon /></svelte:fragment>
              </IconLinkButton>
            {/if}
          </ListTableBodyCell>
        </ListTableBodyRow>
      {/each}
    </svelte:fragment>
  </ListTable>

  <div class="flex items-center gap-x-2">
    <IconLinkButton on:click={handleAddStep}>
      <svelte:fragment slot="icon"><AddIcon /></svelte:fragment>
      <svelte:fragment slot="label">
        {uiContext.str(stringResKeys.testCaseEditor.addStep)}
      </svelte:fragment>
    </IconLinkButton>
    <span>|</span>
    <IconLinkButton on:click={handleAddComment}>
      <svelte:fragment slot="icon"><CommentIcon /></svelte:fragment>
      <svelte:fragment slot="label">
        {uiContext.str(stringResKeys.testCaseEditor.addComment)}
      </svelte:fragment>
    </IconLinkButton>

    <div class="ml-auto">
      <PrimaryButton on:click={handleSave}>
        <span class="flex items-center gap-x-2">
          <SaveIcon class="w-5 h-5" />
          {uiContext.str(stringResKeys.general.save)}
        </span>
      </PrimaryButton>
    </div>
  </div>
</div>

<AlertDialog
  id="dialogDeleteRow"
  bind:type={deleteDialogType}
  buttons={AlertDialogButtons.DeleteCancel}
  on:click={handleDeleteConfirmation}
>
  <div slot="title">{uiContext.str(stringResKeys.general.confirmation)}</div>
  <div slot="content">{uiContext.str(stringResKeys.testCaseEditor.deleteRowConfirmation)}</div>
</AlertDialog>
