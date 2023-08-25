<script lang="ts">
    import IconLinkButton from "$lib/components/IconLinkButton.svelte";
    import { stringResKeys } from "$lib/context/StringResKeys";
    import { uiContextKey, type IUiContext } from "$lib/context/UiContext";
    import AddIcon from "$lib/icons/AddIcon.svelte";
    import CommentIcon from "$lib/icons/CommentIcon.svelte";
    import DeleteIcon from "$lib/icons/DeleteIcon.svelte";
    import MoveDownIcon from "$lib/icons/MoveDownIcon.svelte";
    import MoveUpIcon from "$lib/icons/MoveUpIcon.svelte";
    import { onMount } from "svelte";
    import { createEventDispatcher, getContext } from "svelte";
    const dispatch = createEventDispatcher();

    export let index: number;
    export let canMoveDown: boolean = true;
    export let canMoveUp: boolean = true;

    const uiContext = getContext(uiContextKey) as IUiContext;

    const handleInsertElement = (index: number) => dispatch("insertElement", { index });
    const handleInsertComment = (index: number) => dispatch("insertComment", { index });
    const handleDeleteClick = (index: number) => dispatch("deleteClick", { index });
    const handleMoveUpClick = (index: number) => dispatch("moveUpClick", { index });
    const handleMoveDownClick = (index: number) => dispatch("moveDownClick", { index });

    onMount(() => {});
</script>

<div class="h-full flex flex-nowrap items-center justify-start px-4" data-row-index={index}>
    <IconLinkButton
        on:click={() => handleInsertElement(index)}
        title={uiContext.str(stringResKeys.pageDefinitionEditor.addElement)}
    >
        <svelte:fragment slot="icon"><AddIcon /></svelte:fragment>
    </IconLinkButton>
    <IconLinkButton
        on:click={() => handleInsertComment(index)}
        title={uiContext.str(stringResKeys.pageDefinitionEditor.addComment)}
    >
        <svelte:fragment slot="icon"><CommentIcon /></svelte:fragment>
    </IconLinkButton>
    <IconLinkButton on:click={() => handleDeleteClick(index)} title={uiContext.str(stringResKeys.general.delete)}>
        <svelte:fragment slot="icon"><DeleteIcon /></svelte:fragment>
    </IconLinkButton>
    {#if canMoveUp}
        <IconLinkButton on:click={() => handleMoveUpClick(index)} title={uiContext.str(stringResKeys.general.moveUp)}>
            <svelte:fragment slot="icon"><MoveUpIcon /></svelte:fragment>
        </IconLinkButton>
    {/if}
    {#if canMoveDown}
        <IconLinkButton
            on:click={() => handleMoveDownClick(index)}
            title={uiContext.str(stringResKeys.general.moveDown)}
        >
            <svelte:fragment slot="icon"><MoveDownIcon /></svelte:fragment>
        </IconLinkButton>
    {/if}
</div>

<style>
</style>
