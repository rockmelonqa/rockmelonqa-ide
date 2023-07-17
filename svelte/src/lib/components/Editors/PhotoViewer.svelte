<script lang="ts">
    import "viewerjs/dist/viewer.css";
    import Viewer from "viewerjs";
    import { appContextKey, type IAppContext } from "$lib/context/AppContext";
    import { uiContextKey, type IUiContext } from "$lib/context/UiContext";
    import { fileSystem } from "$lib/ipc";
    import { getContext, onMount } from "svelte";
    import { combinePath } from "../FileExplorer/Node";

    const uiContext = getContext(uiContextKey) as IUiContext;

    export let folderPath: string;
    export let fileName: string;
    $: filePath = combinePath([folderPath, fileName], uiContext.pathSeparator);

    let imgEl: HTMLImageElement;
    onMount(async () => {
        const fileContentBase64 = (await fileSystem.readFileBase64(filePath)) ?? "";
        imgEl.src = "data:image/png;base64," + fileContentBase64;

        const viewer = new Viewer(imgEl, {
            inline: true,
            toolbar: false,
            navbar: false,
            backdrop: "static",
            className: "rm-photo-viewer",
        });
    });
</script>

<!-- This img tag is actually hidden from viewer, the photo is shown in ViewerJS  -->
<img bind:this={imgEl} class="w-1/2 h-1/2 border-0 opacity-0" src="javascript:void(0);" alt={fileName} />

<style>
    /* Don't let the backdrop have fixed size */
    :global(.rm-photo-viewer.viewer-backdrop) {
        background-color: rgba(0, 0, 0, 80%);
        width: 100% !important;
        height: 100% !important;
    }
</style>
