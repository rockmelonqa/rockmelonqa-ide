<script lang="ts">
    import { appContextKey, type IAppContext } from "$lib/context/AppContext";
    import { uiContextKey, type IUiContext } from "$lib/context/UiContext";
    import { fileSystem } from "$lib/ipc";
    import { getContext, onMount } from "svelte";
    import { combinePath } from "../FileExplorer/Node";

    const uiContext = getContext(uiContextKey) as IUiContext;

    export let folderPath: string;
    export let fileName: string;
    $: filePath = combinePath([folderPath, fileName], uiContext.pathSeparator);

    let frameEl: HTMLIFrameElement;
    onMount(async () => {
        let handledPath = "rm-file://" + filePath;
        frameEl.src = handledPath;
    });
</script>

<iframe title="" class="flex-1 w-full h-full border-0" bind:this={frameEl} src="javascript:void(0);" />
